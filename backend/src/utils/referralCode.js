const crypto = require('crypto');

/**
 * Generate a unique 8-character alphanumeric referral code.
 * Uses crypto.randomBytes for cryptographic randomness.
 * @returns {string} e.g. "WP-A3K9M2X7"
 */
const generateReferralCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars: 0/O, 1/I/L
  const bytes = crypto.randomBytes(8);
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `WP-${code}`;
};

module.exports = { generateReferralCode };
