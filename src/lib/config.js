export const configurationFile = {
  development: {
    mongoUrl: "mongodb://localhost:27017/backend-test",

    plaidConnect: {
      PLAID_CLIENT_ID: "600bc50bc2973c000f7d51ce ",
      PLAID_SECRET: "f96cf7b6044909892ff311777a956b"
    },
    dwollaConnect: {
      KEY: "ZCulYxmi1gLMt0HAgAcdtDJ93XWpY1lyDst4Uyf7byODzBqIJN",
      SECRET: "siXTIRpekGZcdN5MFwudMmtqP9iTPimOzxGUao9RnkhvKeGrjt"
    }
  },

  loggerConfig: {
    level: "debug",
    rotation: "d",
    size: 5,
    json: true,
    timestamp: true
  }
};
