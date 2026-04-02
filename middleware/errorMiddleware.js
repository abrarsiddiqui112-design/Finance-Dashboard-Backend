const notFound = (req, res, next) => {
  // ========Unknown Route Handler========
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // ========Validation Errors========
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: Object.values(err.errors).map((item) => item.message)
    });
  }

  // ========Duplicate Key Errors========
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate value detected.",
      field: Object.keys(err.keyValue || {})[0]
    });
  }

  // ========ObjectId Cast Errors========
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid value for ${err.path}.`
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error."
  });
};

module.exports = {
  notFound,
  errorMiddleware
};
