function ErrorResponse(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  Error.captureStackTrace(error, ErrorResponse);
  return error;
}

export default ErrorResponse;
