

/**
 * Wrapper for routes. Does the following:
 * - Routes can be written as async functions
 * - Thrown errors get passed to the `next` callback
 * - Allows you to require fields in the request body
 *   (works only if body-parser is applied earlier) if
 
 */
export function route(callback, options = {}) {
  return async (req, res, next) => {
    try {
      await callback(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}
