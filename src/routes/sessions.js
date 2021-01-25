import { ApplicationError } from "../lib/errors";
import { decodeToken, generateToken } from "../lib/token";
import { route } from "./";

// middleware that verifies that a token is present and is legitimate.
export const verify = async (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(
      new ApplicationError(
        "Missing Authorization header with Bearer token",
        401
      )
    );
    return;
  }

  // strip the leading "Bearer " part from the rest of the token string
  const tokenandUserId = authHeader.substring("Bearer ".length);
  var token = tokenandUserId.split(",");
  try {
    const decoded = await decodeToken(token[1]);
    if (token[0] != decoded.id) {
      throw new ApplicationError("Not found");
    }
    req.body.userId = token[0];
    next();
  } catch (err) {
    // assume failed decoding means bad token string
    next(new ApplicationError("Could not verify token", 401));
  }
};
