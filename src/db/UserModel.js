import BaseModel from "./BaseModel";
import { ApplicationError } from "../lib/errors";
import { filterFields } from "../lib/filter";
import { default as userSchema } from "../schemas/user.schema.js";
import { generateToken } from "../lib/token";
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
  }

  async signUp(newUser) {
    try {
      const userInfo = await this.getUserByEmail(newUser.email);
      if (userInfo) {
        throw new ApplicationError("User already exists!!", 403);
      }
      const verificationCode = getVerificationCode();
      newUser.verificationCode = verificationCode;
      const user = await this.model.create(newUser);
      if (user) {
        sendEmail(newUser.email, verificationCode);
        return { message: "OTP has been sent successfully!!" };
      } else {
        throw new ApplicationError("Something went wrong", 500);
      }
    } catch (error) {
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
  async signIn(phoneNumber) {
    try {
      const client = new plaid.Client({
        clientID: "600bc50bc2973c000f7d51ce",
        secret: "f96cf7b6044909892ff311777a956b",
        env: plaid.environments.sandbox,
        options: {
          version: "2018-05-22" // '2020-09-14' | '2019-05-29' | '2018-05-22' | '2017-03-08'
        }
      });
      const resp = await client.createLinkToken({
        user: { client_user_id: "123-test-user-id" },
        client_name: "Plaid Test App",
        products: ["auth", "transactions"],
        country_codes: ["GB"],
        language: "en",
        webhook: "https://sample-web-hook.com",
        account_filters: {
          depository: { account_subtypes: ["checking", "savings"] }
        }
      });

      const response = await client.getLinkToken(resp.link_token);
      console.log(response.link_token); //Need to pass into frontned
      const getAccessToken = await client.exchangePublicToken(
        "public-sandbox-3a1467da-aa7a-46b8-b0c2-ce9f0e83d935"
      );
      const accountInfomration = await client
        .getAccounts(getAccessToken.access_token)
        .catch(err => {
          console.log(err);
        });

      //Pass this access token to GetPublic Token
      // const publicToken = await client.createPublicToken(
      //   publicExcgangeToken.access_token
      // );
      return accountInfomration;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async verifyOtp(email, verificationCode) {
    try {
      const user = await this.model
        .findOneAndUpdate(
          {
            email: phoneNumber,
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
