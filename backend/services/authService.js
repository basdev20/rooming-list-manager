const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const { generateToken } = require('../utils/jwtUtil');

const register = async ({ username, email, password }) => {
  const exists = await userModel.isUserExists(username, email);
  if (exists) {
    throw new Error('User already exists with this username or email');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userModel.createUser(username, email, hashedPassword);
  const token = generateToken(user);

  return { user, token };
};

const login = async ({ username, password }) => {
  const user = await userModel.findUserByUsernameOrEmail(username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user);
  return { user, token };
};

module.exports = {
  register,
  login
};
