const validator = require("validator");

// Blocklist of known malicious/spam domains
const BLOCKED_DOMAINS = [
  "malware.com",
  "phishing.com",
  "spam.com",
  // Add more as needed
];

// Regex for valid alias: alphanumeric + hyphens, 3-30 chars
const ALIAS_REGEX = /^[a-zA-Z0-9-_]{3,30}$/;

/**
 * Validates a URL - checks format, protocol, and blocklist
 */
function validateUrl(url) {
  if (!url || typeof url !== "string") {
    return { valid: false, error: "URL is required" };
  }

  const trimmed = url.trim();

  if (!validator.isURL(trimmed, { protocols: ["http", "https"], require_protocol: true })) {
    return { valid: false, error: "Invalid URL. Must include http:// or https://" };
  }

  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();

    // Block localhost and private IPs
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.16.")
    ) {
      return { valid: false, error: "Private/local URLs are not allowed" };
    }

    // Check blocklist
    for (const blocked of BLOCKED_DOMAINS) {
      if (hostname === blocked || hostname.endsWith(`.${blocked}`)) {
        return { valid: false, error: "This domain has been blocked" };
      }
    }
  } catch {
    return { valid: false, error: "Could not parse URL" };
  }

  return { valid: true, url: trimmed };
}

/**
 * Validates a custom alias
 */
function validateAlias(alias) {
  if (!alias) return { valid: true }; // alias is optional

  if (!ALIAS_REGEX.test(alias)) {
    return {
      valid: false,
      error: "Alias must be 3-30 characters, alphanumeric with hyphens/underscores only",
    };
  }

  // Block reserved words
  const reserved = ["api", "admin", "dashboard", "stats", "health", "shorten", "login", "register"];
  if (reserved.includes(alias.toLowerCase())) {
    return { valid: false, error: "This alias is reserved" };
  }

  return { valid: true };
}

module.exports = { validateUrl, validateAlias };
