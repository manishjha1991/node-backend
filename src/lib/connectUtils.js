import * as api from "../utils/apiRequest.js";
import { ApplicationError } from "./errors";
import { configurationFile } from "./config";

import * as constants from "./constants";
import Logger from "node-logger-es6";
let logger = Logger.configure(configurationFile.loggerConfig);

// export const getAccessToken = async requestToken => {
//   try {
//     let apiKey = configurationFile[constants.ENVIRONMENT].kiteConnect.apiKey,
//       secret = configurationFile[constants.ENVIRONMENT].kiteConnect.apiSecret;
//     let options = {
//       api_key: apiKey,
//       debug: false
//     };
//     let kc = new KiteConnect(options);
//     const kiteSession = await kc.generateSession(requestToken, secret);
//     kiteSession.request_token = requestToken;
//     return kiteSession;
//   } catch (error) {
//     logger.error(`Token did not get generated: ${error}`);
//     throw error;
//   }
// };

// export const getDetailsForTicker = async (tickerName, exchangeName) => {
//   try {
//     let url = `quote?i=${exchangeName}:${tickerName}`;
//     let tickerInformation = await api.get(url);
//     let ticker = await tickerInformation.json();
//     return ticker;
//   } catch (error) {
//     throw new ApplicationError(error, 500, {});
//   }
// };
