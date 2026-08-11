// Builds an absolute URL for a file under /uploads so every API response
// returns something the client can use directly — no string-concatenation
// with a base URL on the frontend, and it stays correct if the app moves
// domains/ports.
//
// Prefers PUBLIC_APP_URL (set this in .env for prod, especially behind a
// proxy/load balancer where req.protocol/req.get('host') can be wrong).
// Falls back to reading it off the request itself for local/dev use.
const toFileUrl = (req, filename) => {
  if (!filename) return null;
  const base = process.env.PUBLIC_APP_URL || `${req.protocol}://${req.get('host')}`;
  return `${base.replace(/\/+$/, '')}/uploads/${filename}`;
};

module.exports = { toFileUrl };
