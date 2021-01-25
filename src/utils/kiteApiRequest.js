import fetch from "node-fetch";
import * as constants from "../lib/constants";
import { getEnv } from "../lib/env";
import { configurationFile } from "../lib/config";
export async function post(url, payload) {
  return await fetch(`${constants.KITE_API_URL_ROOT}/${url}`, {
    method: "POST",
    body: payload,
    headers: {
      "X-Kite-Version": constants.X_Kite_Version,
      Authorization: `token${
        configurationFile[getEnv("NODE_ENV")].kiteConnect.apiKey
      }:${configurationFile[getEnv("NODE_ENV")].kiteConnect.accessToken}`
    }
  });
}

export async function get(url) {
  return await fetch(`${constants.KITE_API_URL_ROOT}/${url}`, {
    headers: {
      "X-Kite-Version": constants.X_Kite_Version,
      Authorization: `token${
        configurationFile[getEnv("NODE_ENV")].kiteConnect.apiKey
      }:${configurationFile[getEnv("NODE_ENV")].kiteConnect.accessToken}`
    }
  });
}
