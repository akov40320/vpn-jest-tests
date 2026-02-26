const { ValidationError } = require("./errors");
const { isNonEmptyString, validateServer } = require("./validators");

/**
 * Pick the "best" server based on:
 * 1) preferredRegion (if provided)
 * 2) lowest latencyMs (if latency present)
 * 3) stable tie-breaker by host then port
 */
function pickBestServer(servers, preferredRegion = null) {
  if (!Array.isArray(servers) || servers.length === 0) {
    throw new ValidationError("servers must be a non-empty array");
  }

  const normalized = servers.map(validateServer);

  let candidates = normalized;
  if (preferredRegion != null) {
    if (!isNonEmptyString(preferredRegion)) {
      throw new ValidationError("preferredRegion must be a non-empty string");
    }
    const byRegion = normalized.filter(s => s.region.toLowerCase() === preferredRegion.toLowerCase());
    if (byRegion.length > 0) candidates = byRegion;
  }

  const score = (s) => {
    // Unknown latency => treat as very large but stable
    const latency = s.latencyMs == null ? Number.POSITIVE_INFINITY : s.latencyMs;
    return latency;
  };

  candidates.sort((a, b) => {
    const sa = score(a);
    const sb = score(b);
    if (sa !== sb) return sa - sb;
    const hostCmp = a.host.localeCompare(b.host);
    if (hostCmp !== 0) return hostCmp;
    return a.port - b.port;
  });

  return candidates[0];
}

module.exports = { pickBestServer };
