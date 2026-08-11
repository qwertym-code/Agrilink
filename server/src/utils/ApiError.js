/**
 * An error carrying the HTTP status the client should see.
 * Controllers throw these; `errorHandler` is the only place that formats them.
 */
export default class ApiError extends Error {
  constructor(statusCode, message, errors = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
