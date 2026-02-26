const { ConnectionError } = require("./errors");

class FakeTransport {
  constructor({ connectDelayMs = 200, disconnectDelayMs = 50, shouldFail = false } = {}) {
    this.connectDelayMs = connectDelayMs;
    this.disconnectDelayMs = disconnectDelayMs;
    this.shouldFail = shouldFail;
    this.connected = false;
  }

  connect(server, token) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.shouldFail) {
          return reject(new ConnectionError("Handshake failed", { server }));
        }
        this.connected = true;
        resolve({ ok: true, server, tokenMasked: token.slice(0, 4) + "..." });
      }, this.connectDelayMs);
    });
  }

  disconnect() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.connected = false;
        resolve({ ok: true });
      }, this.disconnectDelayMs);
    });
  }
}

module.exports = { FakeTransport };
