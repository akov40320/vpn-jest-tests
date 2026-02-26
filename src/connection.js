const crypto = require("crypto");
const { ConnectionError } = require("./errors");
const { validateConfig } = require("./validators");
const { pickBestServer } = require("./regions");
const { KillSwitch } = require("./killSwitch");
const { FakeTransport } = require("./transport");

function createSessionId() {
  return crypto.randomBytes(8).toString("hex");
}

const State = Object.freeze({
  DISCONNECTED: "DISCONNECTED",
  CONNECTING: "CONNECTING",
  CONNECTED: "CONNECTED",
  DISCONNECTING: "DISCONNECTING",
});

class VpnConnection {
  constructor({ transport = new FakeTransport(), killSwitch = new KillSwitch() } = {}) {
    this.transport = transport;
    this.killSwitch = killSwitch;
    this.state = State.DISCONNECTED;
    this.sessionId = null;
    this.server = null;
  }

  getStatus() {
    return {
      state: this.state,
      sessionId: this.sessionId,
      server: this.server,
      killSwitchEnabled: this.killSwitch.isEnabled(),
    };
  }

  async connect(config) {
    if (this.state === State.CONNECTED || this.state === State.CONNECTING) {
      throw new ConnectionError("Already connected/connecting");
    }
    const valid = validateConfig(config);

    if (valid.killSwitchEnabled) this.killSwitch.enable();
    this.state = State.CONNECTING;

    const server = pickBestServer(valid.servers, valid.preferredRegion);
    this.sessionId = createSessionId();
    this.server = server;

    try {
      await this.transport.connect(server, valid.token);
      this.state = State.CONNECTED;
      return this.getStatus();
    } catch (err) {
      // roll back
      this.state = State.DISCONNECTED;
      this.sessionId = null;
      this.server = null;
      if (valid.killSwitchEnabled) this.killSwitch.disable();
      throw err;
    }
  }

  async disconnect() {
    if (this.state === State.DISCONNECTED) return this.getStatus();
    if (this.state === State.DISCONNECTING) throw new ConnectionError("Already disconnecting");
    this.state = State.DISCONNECTING;
    await this.transport.disconnect();
    this.state = State.DISCONNECTED;
    this.sessionId = null;
    this.server = null;
    this.killSwitch.disable();
    return this.getStatus();
  }

  async reconnect(config) {
    await this.disconnect();
    return this.connect(config);
  }
}

module.exports = { VpnConnection, State, createSessionId };
