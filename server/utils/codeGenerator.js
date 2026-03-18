const { customAlphabet } = require("nanoid");

// Alphanumeric alphabet (no ambiguous chars like 0/O, 1/l)
const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";

const generateCode6 = customAlphabet(alphabet, 6);
const generateCode8 = customAlphabet(alphabet, 8);

/**
 * Generates a unique short code
 * @param {number} length - 6 or 8
 */
function generateShortCode(length = 6) {
  return length === 8 ? generateCode8() : generateCode6();
}

module.exports = { generateShortCode };
