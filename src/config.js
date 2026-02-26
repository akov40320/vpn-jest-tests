const { validateConfig } = require("./validators");

/**
 * Build config from environment variables (typical for CI/demo):
 * - VPN_TOKEN
 * - VPN_PREFERRED_REGION (optional)
 * - VPN_KILLSWITCH (optional: "1"/"true")
 * - VPN_SERVERS_JSON (JSON array of servers)
 */
function configFromEnv(env = process.env) {
  const token = env.VPN_TOKEN;
  const preferredRegion = env.VPN_PREFERRED_REGION ?? null;
  const killSwitchEnabled = String(env.VPN_KILLSWITCH ?? "").toLowerCase() === "true" || String(env.VPN_KILLSWITCH ?? "") === "1";
  const serversJson = env.VPN_SERVERS_JSON;

  let servers;
  try {
    servers = JSON.parse(serversJson || "[]");
  } catch (e) {
    servers = [];
  }

  return validateConfig({ token, servers, preferredRegion, killSwitchEnabled });
}

module.exports = { configFromEnv };
