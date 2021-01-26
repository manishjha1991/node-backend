import * as api from "../utils/apiRequest.js";

import { configurationFile } from "./config";

import Logger from "node-logger-es6";
let logger = Logger.configure(configurationFile.loggerConfig);
//Generate link token which will pass to frontnend to get public token
export const generateLinkToken = async client => {
  try {
    return await client.createLinkToken({
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
  } catch (error) {
    logger.error(`Link Token did not get generated: ${error}`);
    throw error;
  }
};
// Generate publicExchangeToken

export const generatePublicExchangeToken = async (publicToken, client) => {
  try {
    return await client.exchangePublicToken(publicToken);
  } catch (error) {
    logger.error(`Public Exchnage Token did not get generated: ${error}`);
    throw error;
  }
};
export const getAuthInfomration = async payload => {
  try {
    return api.post(payload);
  } catch (eror) {
    logger.error(`getAuthInfomration issue : ${error}`);
    throw error;
  }
};
