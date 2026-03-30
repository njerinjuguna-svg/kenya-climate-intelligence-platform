const jwt = require('jsonwebtoken');

// This middleware protects routes
// It checks if the request has a valid JWT token
const authenticateToken = (req, res, next) => {
  // Token comes in the Authorization header
  // Format: "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next(); // continue to the route
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = authenticateToken;