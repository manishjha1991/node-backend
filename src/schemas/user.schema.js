import mongoose from "mongoose";
import uuid from "uuid";
import validator from "validator";
import * as constants from "../lib/constants";
const User = new mongoose.Schema(
  {
    _id: { type: String, required: true, default: uuid.v1 },
    email: {
      type: String,
      validate: {
        validator: v => validator.isEmail(v)
      },
      message: "{VALUE} is not a valid email",
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    type: {
      type: String
    },
    address: {
      type: String,
      required: true
    },
    ipAddress: {
      type: String,
      required: true
    },
    verificationCode: {
      type: Number,
      default: null
    },
    status: {
      type: String,
      required: true,
      enum: [constants.VERIFIED, constants.NOT_VERIFIED],
      default: constants.NOT_VERIFIED
    }
  },
  { versionKey: false, minimize: false }
);
export default User;
