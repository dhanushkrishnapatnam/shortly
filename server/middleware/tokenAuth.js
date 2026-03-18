/**
 * Passwordless token middleware
 * Reads X-Manage-Token header and attaches it to req.manageToken
 * Returns 401 if missing.
 */
function requireToken(req, res, next) {
  const token = req.headers["x-manage-token"];
  if (!token || typeof token !== "string" || token.length < 10) {
    return res.status(401).json({
      success: false,
      error: "Missing or invalid manage token.",
    });
  }
  req.manageToken = token.trim();
  next();
}

module.exports = { requireToken };
