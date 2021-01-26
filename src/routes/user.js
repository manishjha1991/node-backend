import { route } from "./";
import UserModel from "../db/UserModel";
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

export const verifyOtp = route(async (req, res) => {
  const userModel = new UserModel();
  try {
    const user = await userModel.verifyOtp(
      req.body.email,
      req.body.verificationCode
    );
    res.send({ results: user });
  } catch (error) {
    throw error;
  }
});
// Get Link Api routes
export const getLinkToken = route(async (req, res) => {
  const userModel = new UserModel();
  try {
    console.log(req.body);
    const link = await userModel.getLinkToken(req.body.email);
    res.send({ results: link });
  } catch (error) {
    throw error;
  }
});

// Get getAccessToken token
export const getAccountInformation = route(async (req, res) => {
  console.log(JSON.stringify(req.body.metadata));
  const userModel = new UserModel();
  try {
    const link = await userModel.accountInfomration(
      req.body.token,
      req.body.metadata,
      req.body.email
    );
    res.send({ results: link });
  } catch (error) {
    throw error;
  }
});

//retry otp
export const retryOTP = route(async (req, res) => {
  const userModel = new UserModel();
  try {
    const link = await userModel.reinitiateOtp(req.body.email);
    res.send({ results: link });
  } catch (error) {
    throw error;
  }
});
export const accountTransfer = route(async (req, res) => {
  const userModel = new UserModel();
  try {
    if (
      req.body.senderFundLink &&
      req.body.receiverFundLink &&
      req.body.amount &&
      req.body.currency
    ) {
      const status = await userModel.transferAmount(req.body);
      res.send({ results: status });
    } else {
      res.send({ results: "Please pass mandatory information" });
    }
  } catch (error) {
    throw error;
  }
});
export const transactionList = route(async (req, res) => {
  const userModel = new UserModel();
  try {
    if (req.body.email) {
      const link = await userModel.getBalance(req.body.email);
      res.send({ results: link });
    } else {
      res.send({ results: "Please pass customer id" });
    }
  } catch (error) {
    throw error;
  }
});
