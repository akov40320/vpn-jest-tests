const { ValidationError } = require("../../src/errors");
const { isValidHostname, isValidPort, validateToken, validateServer, validateConfig } = require("../../src/validators");

describe("validators (unit)", () => {
  test("isValidPort accepts 1..65535 and rejects others", () => {
    expect(isValidPort(1)).toBe(true);
    expect(isValidPort(65535)).toBe(true);
    expect(isValidPort(0)).toBe(false);
    expect(isValidPort(70000)).toBe(false);
    expect(isValidPort("443")).toBe(true);
    expect(isValidPort("nope")).toBe(false);
  });

  test("isValidHostname accepts common hostnames and localhost", () => {
    expect(isValidHostname("localhost")).toBe(true);
    expect(isValidHostname("vpn-1.example.com")).toBe(true);
    expect(isValidHostname("bad host")).toBe(false);
    expect(isValidHostname("-bad.example.com")).toBe(false);
  });

  test("validateToken throws on too short token", () => {
    expect(() => validateToken("short_token")).toThrow(ValidationError);
  });

  test("validateToken throws on invalid characters", () => {
    expect(() => validateToken("A".repeat(20) + "!")).toThrow(ValidationError);
  });

  test("validateServer normalizes port to number", () => {
    const s = validateServer({ host: "vpn.example.com", port: "443", region: "EU", latencyMs: 120 });
    expect(s.port).toBe(443);
    expect(s.latencyMs).toBe(120);
  });

  test("validateServer throws on invalid host", () => {
    expect(() => validateServer({ host: "bad host", port: 443, region: "EU" })).toThrow(ValidationError);
  });

  test("validateConfig returns normalized config and boolean killSwitchEnabled", () => {
    const cfg = validateConfig({
      token: "A".repeat(25),
      servers: [{ host: "vpn.example.com", port: 443, region: "EU", latencyMs: 50 }],
      preferredRegion: "eu",
      killSwitchEnabled: "truthy",
    });
    expect(cfg.killSwitchEnabled).toBe(true);
    expect(cfg.servers[0].port).toBe(443);
  });
});
