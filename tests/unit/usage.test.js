const { UsageTracker, bytesFromMegabytes } = require("../../src/usage");
const { ValidationError } = require("../../src/errors");

describe("usage (unit)", () => {
  test("bytesFromMegabytes converts MB to bytes", () => {
    expect(bytesFromMegabytes(1)).toBe(1024 * 1024);
  });

  test("bytesFromMegabytes rejects negative input", () => {
    expect(() => bytesFromMegabytes(-1)).toThrow(ValidationError);
  });

  test("UsageTracker adds usage and tracks remaining", () => {
    const t = new UsageTracker(100);
    t.addUsage(30);
    expect(t.usedBytes).toBe(30);
    expect(t.remainingBytes()).toBe(70);
    expect(t.isExceeded()).toBe(false);
  });

  test("UsageTracker caps usage at quota and flags exceeded", () => {
    const t = new UsageTracker(100);
    t.addUsage(1000);
    expect(t.usedBytes).toBe(100);
    expect(t.remainingBytes()).toBe(0);
    expect(t.isExceeded()).toBe(true);
  });
});
