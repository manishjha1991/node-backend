// Defines an express app that runs the boilerplate codebase.

import "babel-polyfill";
import express from "express";
import compression from "compression";
import https from "https";
import http from "http";
import fs from "fs";
import cors from "cors";
import { getEnv } from "./lib/env";
import createRouter from "./router";
const app = express();
app.use(cors({ origin: "*" }));
app.use(compression());
app.use(createRouter());
console.log(getEnv("NODE_ENV"));
const port = 8000;
const sslOptions = {
  key: fs.readFileSync("./ssl/nginx.key"),
  cert: fs.readFileSync("./ssl/nginx.crt")
};
http
  .createServer(app)
  .listen(3000, () => console.log(`http is running on 3000`));
https
  .createServer(sslOptions, app)
  .listen(port, () => console.log(`https is Listening on port ${port}`));
