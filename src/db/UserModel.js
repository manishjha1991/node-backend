import BaseModel from "./BaseModel";
import { ApplicationError } from "../lib/errors";
import { filterFields } from "../lib/filter";
import { default as userSchema } from "../schemas/user.schema.js";
import { generateToken } from "../lib/token";
import * as constants from "../lib/constants";
import { sendSms, getVerificationCode, sendEmail } from "../lib/utils";
import shortUniqueId from "short-unique-id";
import _ from "lodash";
const uid = new shortUniqueId();

export default class UserModel extends BaseModel {
  constructor(connection) {
    super("user", connection);
    this.schema = userSchema;
    this.name = "user";
    this.model = this.connection.model(this.name, this.schema);
  }

  async create(userInformation) {
    try {
      const user = await this.model.create(userInformation);
      if (!user) {
        return null;
      }
      const PUBLIC_FIELDS = [
        "_id",
        "avatar",
        "firstName",
        "lastName",
        "botChannelId"
      ];
      return filterFields(user, PUBLIC_FIELDS);
    } catch (error) {
      throw new ApplicationError(error, 500, {});
    }
  }

  async signUp(newUser) {
    try {
      const userInfo = await this.getUserByPhoneNumber(newUser.phoneNumber);
      if (userInfo) {
        throw new ApplicationError("User already exists!!", 403);
      }
      const verificationCode = getVerificationCode();
      newUser._id = newUser.firebaseId;
      newUser.verificationCode = verificationCode;
      newUser.referralToken = uid.randomUUID(8);
      const user = await this.model.create(newUser);
      if (user) {
        sendSms(newUser.phoneNumber, verificationCode);
        sendEmail(newUser.email, verificationCode);
        return { message: "OTP has been sent successfully!!" };
      } else {
        throw new ApplicationError("Something went wrong", 500);
      }
    } catch (error) {
      throw error;
    }
  }

  async signIn(phoneNumber) {
    try {
      const verificationCode = getVerificationCode();
      const user = await this.model.findOneAndUpdate(
        { phoneNumber: phoneNumber },
        { $set: { verificationCode: verificationCode } },
        { new: true }
      );
      if (!user) {
        throw new ApplicationError("No record found!!", 403);
      }
      sendSms(phoneNumber, verificationCode);
      sendEmail(user.email, verificationCode);
      return { message: "OTP has been sent successfully!!" };
    } catch (error) {
      throw error;
    }
  }

  async verifyOtp(phoneNumber, verificationCode) {
    try {
      const user = await this.model
        .findOneAndUpdate(
          {
            phoneNumber: phoneNumber,
            verificationCode: verificationCode
          },
          { $set: { verificationCode: null, status: constants.VERIFIED } },
          { new: true }
        )
        .lean();
      if (!user) {
        throw new ApplicationError("Invalid details!!", 403);
      }
      const portfolioModel = new PortfolioModel();
      const portfolio = await portfolioModel.getUserPortfolio(user._id);
      user.portfolio = portfolio;
      user.token = await generateToken(user.firebaseId);
      return user;
    } catch (error) {
      throw error;
    }
  }

  //This function will be removed once new signup and login flow will be in use
  async get(userInformation) {
    try {
      let { phoneNumber } = userInformation;
      const user = await this.model
        .find({
          phoneNumber: phoneNumber
        })
        .lean();
      if (!user[0]) {
        return null;
      } else {
        return user[0];
      }
    } catch (error) {
      throw new ApplicationError(error, 500, {});
    }
  }

  async getAllUsers() {
    try {
      const users = await this.model.find();
      return users;
    } catch (error) {
      throw new ApplicationError(error, 500, {});
    }
  }

  async getUsers(userIds) {
    try {
      let userInfo = await this.model.find({
        firebaseId: { $in: userIds }
      });
      return userInfo;
    } catch (error) {
      throw error;
    }
  }

  async update(id, userInformation) {
    try {
      const fieldsToUpdate = _.pick(userInformation, [
        "firstName",
        "lastName",
        "email",
        "gender",
        "avatar"
      ]);
      const user = await this.model.findOneAndUpdate(
        { firebaseId: id },
        { $set: fieldsToUpdate },
        { new: true }
      );
      if (!user) {
        return null;
      }
      return user;
    } catch (error) {
      throw error;
    }
  }
}
