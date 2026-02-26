const { VpnConnection, State } = require("../../src/connection");
const { FakeTransport } = require("../../src/transport");
const { KillSwitch } = require("../../src/killSwitch");

describe("functional: connect lifecycle", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("connect -> connected -> disconnect (with kill switch)", async () => {
    const transport = new FakeTransport({ connectDelayMs: 200, disconnectDelayMs: 50 });
    const ks = new KillSwitch();
    const conn = new VpnConnection({ transport, killSwitch: ks });

    const config = {
      token: "A".repeat(25),
      servers: [
        { host: "us1.example.com", port: 443, region: "US", latencyMs: 40 },
        { host: "eu1.example.com", port: 443, region: "EU", latencyMs: 10 },
      ],
      preferredRegion: "EU",
      killSwitchEnabled: true,
    };

    const promise = conn.connect(config);
    expect(conn.state).toBe(State.CONNECTING);
    expect(ks.isEnabled()).toBe(true);

    await jest.advanceTimersByTimeAsync(200);
    const status = await promise;

    expect(status.state).toBe(State.CONNECTED);
    expect(status.server.host).toBe("eu1.example.com");

    const dis = conn.disconnect();
    expect(conn.state).toBe(State.DISCONNECTING);
    await jest.advanceTimersByTimeAsync(50);
    const status2 = await dis;

    expect(status2.state).toBe(State.DISCONNECTED);
    expect(ks.isEnabled()).toBe(false);
  });
});
