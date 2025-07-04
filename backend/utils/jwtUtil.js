const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-in-production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

module.exports = {
  generateToken
};
