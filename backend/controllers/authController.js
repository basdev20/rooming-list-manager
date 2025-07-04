const authService = require('../services/authService');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const { user, token } = await authService.register({ username, email, password });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user
    });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const { user, token } = await authService.login({ username, password });

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    res.status(401).json({ error: error.message || 'Login failed' });
  }
};

module.exports = {
  register,
  login
};
