const { configFromEnv } = require("../../src/config");
const { VpnConnection, State } = require("../../src/connection");
const { FakeTransport } = require("../../src/transport");

describe("functional: env config -> connect -> reconnect", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
    delete process.env.VPN_TOKEN;
    delete process.env.VPN_SERVERS_JSON;
    delete process.env.VPN_PREFERRED_REGION;
    delete process.env.VPN_KILLSWITCH;
  });

  test("build config from env and reconnect changes sessionId", async () => {
    process.env.VPN_TOKEN = "B".repeat(30);
    process.env.VPN_PREFERRED_REGION = "US";
    process.env.VPN_KILLSWITCH = "1";
    process.env.VPN_SERVERS_JSON = JSON.stringify([
      { host: "us1.example.com", port: 443, region: "US", latencyMs: 15 },
      { host: "eu1.example.com", port: 443, region: "EU", latencyMs: 5 },
    ]);

    const cfg = configFromEnv();
    const conn = new VpnConnection({ transport: new FakeTransport({ connectDelayMs: 100, disconnectDelayMs: 10 }) });

    const p1 = conn.connect(cfg);
    await jest.advanceTimersByTimeAsync(100);
    const s1 = await p1;
    expect(s1.state).toBe(State.CONNECTED);
    expect(s1.server.region).toBe("US"); // preferredRegion wins even if EU lower latency

    const p2 = conn.reconnect(cfg);
    // disconnect 10ms + connect 100ms
    await jest.advanceTimersByTimeAsync(110);
    const s2 = await p2;
    expect(s2.state).toBe(State.CONNECTED);
    expect(s2.sessionId).not.toBe(s1.sessionId);
  });
});
