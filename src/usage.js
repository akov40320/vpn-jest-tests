const { ValidationError } = require("./errors");

function bytesFromMegabytes(mb) {
  const n = Number(mb);
  if (!Number.isFinite(n) || n < 0) throw new ValidationError("megabytes must be a non-negative number");
  return Math.floor(n * 1024 * 1024);
}

class UsageTracker {
  constructor(quotaBytes) {
    const q = Number(quotaBytes);
    if (!Number.isFinite(q) || q <= 0) throw new ValidationError("quotaBytes must be a positive number");
    this.quotaBytes = Math.floor(q);
    this.usedBytes = 0;
  }

  addUsage(bytes) {
    const b = Number(bytes);
    if (!Number.isFinite(b) || b < 0) throw new ValidationError("bytes must be a non-negative number");
    this.usedBytes = Math.min(this.quotaBytes, this.usedBytes + Math.floor(b));
    return this.usedBytes;
  }

  remainingBytes() {
    return Math.max(0, this.quotaBytes - this.usedBytes);
  }

  isExceeded() {
    return this.usedBytes >= this.quotaBytes;
  }
}

module.exports = { UsageTracker, bytesFromMegabytes };
