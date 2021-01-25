import requestify from "requestify";
import nodemailer from "nodemailer";
import * as constants from "../lib/constants";
export const createRandomNumber = GROUP_ID_PREFIX => {
  let rand = Math.random()
    .toString(36)
    .substr(2, 16);
  return GROUP_ID_PREFIX + rand;
};

export const sendSms = async (phoneNumber, verificationCode) => {
  try {
    const message = `${verificationCode} ${constants.OTP_MESSAGE}`;
    const url = `http://api-alerts.solutionsinfini.com/v3/?method=sms&api_key=A31cf85c3cc3b65100bf9bd7fbe30cd90&to=+91${phoneNumber}&sender=SIDEMO&message=${message}`;
    await externalApiRequest(url, "GET");
  } catch (error) {
    throw error;
  }
};

export const sendEmail = async (email, verificationCode) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: constants.EMAIL.userName,
      pass: constants.EMAIL.password
    }
  });
  var mailOptions = {
    from: constants.EMAIL.userName,
    to: email,
    subject: "Verification Code from Basis",
    text: `${verificationCode}  ${constants.OTP_MESSAGE}`
  };
  return await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      throw error;
    }
  });
};

export const externalApiRequest = async (
  url,
  method,
  body = null,
  headers = null,
  dataType = null
) => {
  try {
    const response = await requestify.request(url, {
      method,
      body,
      headers,
      dataType
    });
    return {
      code: response.getCode(),
      headers: response.getHeaders(),
      body: response.getBody()
    };
  } catch (err) {
    return {
      code: err.getCode(),
      headers: err.getHeaders(),
      body: err.getBody()
    };
  }
};

export const getVerificationCode = () =>
  Math.floor(Math.random() * 8999 + 1000);
