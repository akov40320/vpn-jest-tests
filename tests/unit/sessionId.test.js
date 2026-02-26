const { createSessionId } = require("../../src/connection");

describe("session id (unit)", () => {
  test("createSessionId returns 16-char hex string", () => {
    const id = createSessionId();
    expect(id).toMatch(/^[0-9a-f]{16}$/);
  });

  test("createSessionId produces different values across calls", () => {
    const a = createSessionId();
    const b = createSessionId();
    expect(a).not.toBe(b);
  });
});
