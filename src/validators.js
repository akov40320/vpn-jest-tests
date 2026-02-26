const { ValidationError } = require("./errors");

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function isValidPort(port) {
  const n = Number(port);
  return Number.isInteger(n) && n >= 1 && n <= 65535;
}

function isValidHostname(host) {
  // Pragmatic hostname check: letters/digits/dots/hyphens, no spaces.
  if (!isNonEmptyString(host)) return false;
  if (host.length > 253) return false;
  if (host.includes(" ")) return false;
  // Allow localhost for local dev
  if (host === "localhost") return true;
  // Basic label validation
  const labels = host.split(".");
  return labels.every(l => /^[a-zA-Z0-9-]{1,63}$/.test(l) && !l.startsWith("-") && !l.endsWith("-"));
}

function validateToken(token) {
  if (!isNonEmptyString(token)) {
    throw new ValidationError("VPN token must be a non-empty string");
  }
  // example policy: 20..200 chars, url-safe-ish
  if (token.length < 20 || token.length > 200) {
    throw new ValidationError("VPN token length must be between 20 and 200 characters", { length: token.length });
  }
  if (!/^[A-Za-z0-9._-]+$/.test(token)) {
    throw new ValidationError("VPN token contains invalid characters");
  }
  return token;
}

function validateServer(server) {
  if (!server || typeof server !== "object") {
    throw new ValidationError("Server must be an object");
  }
  const { host, port, region, latencyMs } = server;

  if (!isValidHostname(host)) {
    throw new ValidationError("Invalid server host", { host });
  }
  if (!isValidPort(port)) {
    throw new ValidationError("Invalid server port", { port });
  }
  if (!isNonEmptyString(region)) {
    throw new ValidationError("Server region must be a non-empty string", { region });
  }
  if (latencyMs != null) {
    const l = Number(latencyMs);
    if (!Number.isFinite(l) || l < 0) {
      throw new ValidationError("Server latencyMs must be a non-negative number", { latencyMs });
    }
  }

  return { host, port: Number(port), region, latencyMs: latencyMs == null ? null : Number(latencyMs) };
}

function validateConfig(config) {
  if (!config || typeof config !== "object") {
    throw new ValidationError("Config must be an object");
  }
  const token = validateToken(config.token);
  const servers = Array.isArray(config.servers) ? config.servers.map(validateServer) : null;
  if (!servers || servers.length === 0) {
    throw new ValidationError("Config.servers must be a non-empty array");
  }
  const preferredRegion = config.preferredRegion ?? null;
  if (preferredRegion != null && !isNonEmptyString(preferredRegion)) {
    throw new ValidationError("preferredRegion must be a string if provided");
  }
  const killSwitchEnabled = Boolean(config.killSwitchEnabled);

  return { token, servers, preferredRegion, killSwitchEnabled };
}

module.exports = {
  isNonEmptyString,
  isValidPort,
  isValidHostname,
  validateToken,
  validateServer,
  validateConfig,
};
