// Utility function for success responses
export const sendSuccessResponse = (resp, statusCode, message, data) => {
  return resp.status(statusCode).json({
    status: statusCode,
    message,
    data,
  });
};

// Utility function for error responses
export const sendErrorResponse = (resp, statusCode, message) => {
  return resp.status(statusCode).json({
    status: statusCode,
    message,
  });
};
