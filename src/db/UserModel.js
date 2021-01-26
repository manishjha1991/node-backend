import BaseModel from "./BaseModel";
import ip from "ip";
import { ApplicationError } from "../lib/errors";
import {
  generateLinkToken,
  generatePublicExchangeToken
} from "../lib/connectUtils";
import { createCustomer, addFundAccount } from "../lib/dwollaUtils";
import { default as userSchema } from "../schemas/user.schema.js";
import * as constants from "../lib/constants";
import { getVerificationCode, sendEmail } from "../lib/utils";
import shortUniqueId from "short-unique-id";
import * as plaid from "plaid";
import _ from "lodash";
const uid = new shortUniqueId();

var Client = require("dwolla-v2").Client;

export default class UserModel extends BaseModel {
  constructor(connection) {
    super("user", connection);
    this.schema = userSchema;
    this.name = "user";
    this.model = this.connection.model(this.name, this.schema);
    this.client = new plaid.Client({
      clientID: process.env.P_CLIENTID,
      secret: process.env.P_SECRETID,
      env: process.env.P_ENV,
      options: {
        version: process.env.P_VERSION
      }
    });

    this.appToken = new Client({
      key: process.env.D_KEY,
      secret: process.env.D_SECRET,
      environment: process.env.D_ENV
    });
  }

  async signUp(newUser) {
    try {
      const userInfo = await this.getUserByEmail(newUser.email);
      if (userInfo) {
        throw new ApplicationError("User already exists!!", 403);
      }
      const verificationCode = getVerificationCode();
      newUser.verificationCode = verificationCode;
      newUser.ipAddress = ip.address();
      const user = await this.model.create(newUser);
      if (user) {
        // sendEmail(newUser.email, verificationCode);
        return { message: "OTP has been sent successfully!!" };
      } else {
        throw new ApplicationError("Something went wrong", 500);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getUserByEmail(email) {
    try {
      const user = await this.model.findOne({
        email: email
      });
      return user || null;
    } catch (error) {
      throw new ApplicationError(error, 500, {});
    }
  }
  async checkVarificationStatus(email) {
    try {
      const user = await this.model.findOne({
        status: constants.VERIFIED,
        email: email
      });
      return user || null;
    } catch (error) {
      throw new ApplicationError(error, 500, {});
    }
  }
  //Get Link Token
  async updatePartial(email, type) {
    return await this.model.findOneAndUpdate(
      {
        email: email,
        status: constants.VERIFIED
      },
      {
        $set: {
          type: type
        }
      },
      { new: true }
    );
  }
  async updateAccountDeatils(email, type, routing, accountNumber) {
    return await this.model.findOneAndUpdate(
      {
        email: email,
        status: constants.VERIFIED
      },
      {
        $set: {
          type: type,
          routingNumber: routing,
          accountNumber: accountNumber
        }
      },
      { new: true }
    );
  }
  async getLinkToken(email) {
    try {
      const user = await this.checkVarificationStatus(email);
      if (user) {
        return await generateLinkToken(this.client);
      } else {
        return { message: "Account is not verified!!" };
      }
    } catch (error) {
      return error;
    }
  }
  async updateDwollaInfomration(email, customerLink, fundLink, accountID) {
    return await this.model.findOneAndUpdate(
      {
        email: email,
        status: constants.VERIFIED
      },
      {
        $set: {
          customerLink: customerLink,
          fundLink: fundLink,
          dwollaAccountId: accountID
        }
      },
      { new: true }
    );
  }
  // get account information
  async accountInfomration(publicToken, metadata, email) {
    try {
      const getAccessToken = await generatePublicExchangeToken(
        metadata.public_token,
        this.client
      );
      const authInfomration = await this.client
        .getAuth(getAccessToken.access_token, {})
        .catch(err => {
          console.log(err);
        });
      if (
        authInfomration.numbers.ach[0].routing &&
        authInfomration.numbers.ach[0].account &&
        authInfomration.accounts[0].subtype
      ) {
        await this.updateAccountDeatils(
          email,
          authInfomration.accounts[0].subtype,
          authInfomration.numbers.ach[0].routing,
          authInfomration.numbers.ach[0].account
        );
        const user = await this.getUserByEmail(email);
        const resp = await this.appToken.get("/");
        const dwollaAccountID = resp.body._links.account.href;
        const dwollaUserCreation = await createCustomer(this.appToken, user);
        const customerLocation = dwollaUserCreation.headers.get("location");
        const dwollaFundCreation = await addFundAccount(
          this.appToken,
          authInfomration.numbers.ach[0].routing,
          authInfomration.numbers.ach[0].account,
          authInfomration.accounts[0].subtype,
          `${user.firstName} ${user.lastName} is checking`,
          customerLocation
        );
        const fundLocation = dwollaFundCreation.headers.get("location");
        return await this.updateDwollaInfomration(
          email,
          customerLocation,
          fundLocation,
          dwollaAccountID
        );
      } else {
        return { message: "Something wrong with get auth information !!" };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async reinitiateOtp(email) {
    try {
      const verificationCode = getVerificationCode();
      const user = await this.model
        .findOneAndUpdate(
          {
            email: email,
            status: constants.NOT_VERIFIED
          },
          {
            $set: {
              verificationCode: verificationCode,
              status: constants.NOT_VERIFIED
            }
          },
          { new: true }
        )
        .lean();
      if (user) {
        sendEmail(email, verificationCode);
      }
      if (!user) {
        throw new ApplicationError("Invalid details!!", 403);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
  async transferAmount(info) {
    try {
      var transferRequest = {
        _links: {
          source: {
            href: info.senderFundLink
          },
          destination: {
            href: info.receiverFundLink
          }
        },
        amount: {
          currency: info.currency,
          value: info.amount
        }
      };
      const respo = await this.appToken.post("transfers", transferRequest);
      return respo.headers.get("location");
      // .then(function(res) {
      //   return respo.headers.get("location"); /
      // });
    } catch (error) {
      return error;
    }
  }
  async getBalance(email) {
    try {
      const user = await this.getUserByEmail(email);
      var fundingLink = user.fundLink;
      const resp = await this.appToken.get(`${fundingLink}/balance`);
      return resp.balance.amount;
    } catch (error) {
      return error;
    }
  }
  async verifyOtp(email, verificationCode) {
    try {
      const user = await this.model
        .findOneAndUpdate(
          {
            email: email,
            verificationCode: verificationCode
          },
          { $set: { verificationCode: null, status: constants.VERIFIED } },
          { new: true }
        )
        .lean();
      if (!user) {
        throw new ApplicationError("Invalid details!!", 403);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
}
