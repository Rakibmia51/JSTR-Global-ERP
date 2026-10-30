// Placeholder auth. In the real ERP, replace this with JWT/session middleware
// that sets req.userId from the verified token.
export function auth(req, _res, next) {
  req.userId = req.header("x-user-id") || "demo-user";
  next();
}
