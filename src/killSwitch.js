class KillSwitch {
  constructor() {
    this._enabled = false;
  }

  enable() {
    this._enabled = true;
  }

  disable() {
    this._enabled = false;
  }

  isEnabled() {
    return this._enabled;
  }
}

module.exports = { KillSwitch };
