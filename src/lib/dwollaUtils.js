import Logger from "node-logger-es6";
import { configurationFile } from "./config";
let logger = Logger.configure(configurationFile.loggerConfig);
export const createCustomer = async (auth, user) => {
  try {
    return await auth.post("customers", {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      ipAddress: user.ipAddress
      // type: "personal",
      // address1: "99-99 33rd St",
      // city: "Some City",
      // state: "NY",
      // postalCode: "11101",
      // dateOfBirth: "1970-01-01",
      // ssn: "1234"
    });
  } catch (error) {
    logger.error(`Link Token did not get generated: ${error}`);
    throw error;
  }
};
export const addFundAccount = async (
  auth,
  routingNumber,
  accountNumber,
  bankAccountType,
  arbitraryNickname,
  customerUrl
) => {
  var requestBody = {
    routingNumber: routingNumber,
    accountNumber: accountNumber,
    bankAccountType: bankAccountType,
    name: arbitraryNickname
  };
  return await auth.post(`${customerUrl}/funding-sources`, requestBody);
};
