// Defines an express app that runs the boilerplate codebase.

import bodyParser from "body-parser";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import Logger from "node-logger-es6";
import { configurationFile } from "./lib/config";
import { ApplicationError } from "./lib/errors";
import {
  signUp as userSignUpRoutes,
  signIn as userSignInRoutes,
  verifyOtp as verifyOtpRoutes,
  retryOTP as retryOTPRoutes,
  getLinkToken as generatedLinkTokenRoutes,
  getAccountInformation as getAccountInformationRoutes,
  accountTransfer as accountTransferRoute,
  transactionList as transactionListRoutes
} from "./routes/user";

const logger = Logger.configure(configurationFile.loggerConfig);

export default function createRouter() {
  // *********
  // * SETUP *
  // *********

  const router = express.Router();

  // static assets, served from "/public" on the web
  router.use("/public", express.static(path.join(__dirname, "..", "public")));

  router.use(cookieParser()); // parse cookies automatically
  router.use(bodyParser.json()); // parse json bodies automatically

  /**
   * Uncached routes:
   * All routes that shouldn't be cached (i.e. non-static assets)
   * should have these headers to prevent 304 Unmodified cache
   * returns. This middleware applies it to all subsequently
   * defined routes.
   */
  router.get("/*", (req, res, next) => {
    res.set({
      "Last-Modified": new Date().toUTCString(),
      Expires: -1,
      "Cache-Control": "must-revalidate, private"
    });
    next();
  });

  // *****************
  // * API ENDPOINTS *
  // *****************

  // users endpoints

  router.post("/signup", userSignUpRoutes);
  router.get("/signin", userSignInRoutes);
  router.post("/retry-otp", retryOTPRoutes);
  router.post("/verifyotp", verifyOtpRoutes);
  router.post("/link", generatedLinkTokenRoutes);
  router.post("/account-info", getAccountInformationRoutes);
  router.post("/transfer", accountTransferRoute);
  router.post("/balance", transactionListRoutes);
  // router.post("/account-info", getAccountInformationRoutes);

  // ******************
  // * ERROR HANDLING *
  // ******************

  // 404 route
  router.all("/*", (req, res, next) => {
    next(new ApplicationError("Not Found", 404));
  });

  // catch all ApplicationErrors, then output proper error responses.
  //
  // NOTE: express relies on the fact the next line has 4 args in
  // the function signature to trigger it on errors. So, don't
  // remove the unused arguments!
  router.use((err, req, res, next) => {
    if (err instanceof ApplicationError) {
      res.status(err.statusCode).send({
        data: err.data || {},
        message: { errMsg: err.message, errCode: err.statusCode }
      });
      return;
    }
    // If we get here, the error could not be handled.
    // Log it for debugging purposes later.
    logger.error("Uncaught error: ", JSON.stringify(err));
    res.status(500).send({
      message: "Uncaught error"
    }); // uncaught exception
  });

  // *******************
  // * CATCH ALL ROUTE *
  // *******************

  /**
   * If you want all other routes to render something like a one-page
   * frontend app, you can do so here; else, feel free to delete
   * the following comment.
   */
  /*
   * function renderFrontendApp(req, res, next) {
   * // all other pages route to the frontend application.
   * router.get('/*', renderFrontendApp);
   */

  return router;
}
