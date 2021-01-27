// Defines an express app that runs the boilerplate codebase.

import "babel-polyfill";
import express from "express";
import compression from "compression";
import https from "https";
import http from "http";
import fs from "fs";
import cors from "cors";
import client from "plaid";
import { getEnv } from "./lib/env";
import createRouter from "./router";
const app = express();
app.use(cors({ origin: "*" }));
app.use(compression());
app.use(createRouter());
console.log(getEnv("NODE_ENV"));
require("dotenv").config();
const port = 8000;
const sslOptions = {
  key: fs.readFileSync("./ssl/test.key"),
  cert: fs.readFileSync("./ssl/test.crt")
};
http
  .createServer(app)
  .listen(9000, () => console.log(`http is running on 9000`));
https
  .createServer(sslOptions, app)
  .listen(port, () => console.log(`https is Listening on port ${port}`));
