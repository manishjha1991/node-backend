import { route } from "./";
import { hashPassword, comparePassword } from "../lib/crypto";
import { generateToken } from "../lib/token";
import UserModel from "../db/UserModel";
import { filterFields } from "../lib/filter";
import { ApplicationError } from "../lib/errors";
import _ from "lodash";

export const signUp = route(async (req, res) => {
  const userModel = new UserModel();
  try {
    const newUser = req.body;
    if (!_.isEmpty(newUser)) {
      const user = await userModel.signUp(newUser);
      res.send({ results: user });
    } else {
      throw new ApplicationError("Please provide correct information!!", 501);
    }
  } catch (error) {
    throw error;
  }
});

export const signIn = route(async (req, res) => {
  const userModel = new UserModel();
  try {
    const user = await userModel.signIn();
    res.send({ results: user });
  } catch (error) {
    throw error;
  }
});

export const verifyOtp = route(
  async (req, res) => {
    const userModel = new UserModel();
    try {
      const user = await userModel.verifyOtp(
        req.body.phoneNumber,
        req.body.verificationCode
      );
      res.send({ results: user });
    } catch (error) {
      throw error;
    }
  },
  {
    requiredFields: ["phoneNumber", "verificationCode"]
  }
);
