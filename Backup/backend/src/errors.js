class AppError extends Error {
  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

class RateLimitError extends AppError {
  constructor(message) {
    super(message, 429);
    this.name = "RateLimitError";
  }
}

class NotFoundError extends AppError {
  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  constructor(message) {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

class FileStorageError extends AppError {
  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  constructor(message) {
    super(message, 500);
    this.name = "FileStorageError";
  }
}

module.exports = {
  AppError,
  ValidationError,
  RateLimitError,
  NotFoundError,
  FileStorageError,
};
