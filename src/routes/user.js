import { route } from "./";
import { hashPassword, comparePassword } from "../lib/crypto";
import { generateToken } from "../lib/token";
import UserModel from "../db/UserModel";
import { filterFields } from "../lib/filter";
import { ApplicationError } from "../lib/errors";
import _ from "lodash";

//This function will be removed once new signup and login flow will be in use
export const create = route(async (req, res) => {
  const userModel = new UserModel();
  try {
    const userInformation = req.body;
    let { password } = req.body;
    let newUser = Object.assign({}, userInformation, {
      password: await hashPassword(password)
    });
    if (!_.isEmpty(newUser)) {
      const user = await userModel.create(newUser);
      let { _id } = user;
      let newUserWithAuthToken = Object.assign({}, userInformation, {
        token: await generateToken(_id)
      });
      res.send({ results: newUserWithAuthToken });
    } else {
      throw new ApplicationError("No userInformation Provided !!!", 501, {});
    }
  } catch (error) {
    throw new ApplicationError(error, 500, {});
  }
});

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

export const signIn = route(
  async (req, res) => {
    const userModel = new UserModel();
    try {
      const user = await userModel.signIn(req.body.phoneNumber);
      res.send({ results: user });
    } catch (error) {
      throw error;
    }
  },
  {
    requiredFields: ["phoneNumber"]
  }
);

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

//This function will be removed once new signup and login flow will be in use
export const get = route(async (req, res) => {
  const userModel = new UserModel();
  try {
    const user = await userModel.get(req.body);
    let { password, _id } = user;
    let checkPassword = await comparePassword(req.body.password, password);
    if (checkPassword) {
      let userWithAuthToken = Object.assign({}, user, {
        token: await generateToken(_id)
      });
      const PUBLIC_FIELDS = ["_id", "avatar", "firstName", "lastName", "token"];
      res.send({ results: filterFields(userWithAuthToken, PUBLIC_FIELDS) });
    } else {
      throw new ApplicationError("Wrong password !!!", 501, {});
    }
  } catch (error) {
    throw new ApplicationError(error, 500, {});
  }
});

export const update = route(async (req, res) => {
  const userModel = new UserModel();
  try {
    const userInformation = req.body;
    if (!_.isEmpty(userInformation)) {
      const user = await userModel.update(req.body.userId, userInformation);
      res.send({ results: user });
    } else {
      throw new ApplicationError("No userInformation Provided !!!", 501, {});
    }
  } catch (error) {
    throw new ApplicationError(error, 500, {});
  }
});
