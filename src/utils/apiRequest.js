import fetch from "node-fetch";
import * as constants from "../lib/constants";
import { getEnv } from "../lib/env";
import { configurationFile } from "../lib/config";
export async function post(url, payload) {
  return await fetch(url, {
    method: "POST",
    body: payload,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

export async function dwollaPost(url, payload) {
  return await fetch(url, {
    method: "POST",
    body: payload,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
export async function getAccessToken(url, payload) {
  return await fetch(url, {
    method: "POST",
    body: payload,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
