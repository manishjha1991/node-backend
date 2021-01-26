import BaseModel from "./BaseModel";
import ip from "ip";
import { ApplicationError } from "../lib/errors";
import {
  generateLinkToken,
  generatePublicExchangeToken,
  getAuthInfomration
} from "../lib/connectUtils";
import { default as userSchema } from "../schemas/user.schema.js";
import * as constants from "../lib/constants";
import { sendSms, getVerificationCode, sendEmail } from "../lib/utils";
import shortUniqueId from "short-unique-id";
import * as plaid from "plaid";
import _ from "lodash";
const uid = new shortUniqueId();

export default class UserModel extends BaseModel {
  constructor(connection) {
    super("user", connection);
    this.schema = userSchema;
    this.name = "user";
    this.model = this.connection.model(this.name, this.schema);
    this.client = new plaid.Client({
      clientID: "600bc50bc2973c000f7d51ce",
      secret: "f96cf7b6044909892ff311777a956b",
      env: plaid.environments.sandbox,
      options: {
        version: "2018-05-22" // '2020-09-14' | '2019-05-29' | '2018-05-22' | '2017-03-08'
      }
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
      console.log(email, "YOOOO");
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
  async getLinkToken(email) {
    try {
      const user = await this.checkVarificationStatus(email);
      console.log(user);
      if (user) {
        return await generateLinkToken(this.client);
      } else {
        return { message: "Account is not verified!!" };
      }
    } catch (error) {
      return error;
    }
  }

  // get account information
  async accountInfomration(publicToken, metadata) {
    console.log(metadata.accounts[1].id);
    try {
      const getAccessToken = await generatePublicExchangeToken(
        publicToken,
        this.client
      );
      const accountInfomration = await this.client
        .getAccounts(getAccessToken.access_token)
        .catch(err => {
          console.log(err);
        });
      const processorTokenResponse = await this.client.createProcessorToken(
        getAccessToken.access_token,
        metadata.accounts[0].id,
        "dwolla"
      );

      const payload = {
        client_id: "600bc50bc2973c000f7d51ce",
        secret: "f96cf7b6044909892ff311777a956b",
        processor_token: processorTokenResponse
      };
      const authInfomration = await getAuthInfomration(payload);

      console.log(authInfomration, "yesss");
      return accountInfomration;
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
