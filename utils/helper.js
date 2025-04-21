export const asyncHandler = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (error) {
    console.error("Error:", error);
    return sendErrorResponse(res, 500, "Internal server error");
  }
};
