const { pickBestServer } = require("../../src/regions");
const { ValidationError } = require("../../src/errors");

describe("regions (unit)", () => {
  const servers = [
    { host: "eu1.example.com", port: 443, region: "EU", latencyMs: 50 },
    { host: "us1.example.com", port: 443, region: "US", latencyMs: 20 },
    { host: "eu2.example.com", port: 443, region: "EU", latencyMs: 30 },
  ];

  test("pickBestServer prefers preferredRegion when available", () => {
    const best = pickBestServer(servers, "EU");
    expect(best.region).toBe("EU");
    expect(best.host).toBe("eu2.example.com"); // EU lowest latency
  });

  test("pickBestServer falls back to global lowest latency if preferredRegion missing", () => {
    const best = pickBestServer(servers, "ASIA");
    expect(best.host).toBe("us1.example.com");
  });

  test("pickBestServer uses stable tiebreaker host/port when latencies equal", () => {
    const s = [
      { host: "b.example.com", port: 443, region: "EU", latencyMs: 10 },
      { host: "a.example.com", port: 443, region: "EU", latencyMs: 10 },
    ];
    const best = pickBestServer(s, "EU");
    expect(best.host).toBe("a.example.com");
  });

  test("pickBestServer throws if servers empty", () => {
    expect(() => pickBestServer([])).toThrow(ValidationError);
  });
});
