class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}

class ConnectionError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ConnectionError";
    this.details = details;
  }
}

module.exports = { ValidationError, ConnectionError };
