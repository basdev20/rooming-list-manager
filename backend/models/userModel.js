const { pool } = require('../config/database');

const findUserByUsernameOrEmail = async (identifier) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1 OR email = $1',
    [identifier]
  );
  return result.rows[0];
};

const createUser = async (username, email, hashedPassword) => {
  const result = await pool.query(
    'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
    [username, email, hashedPassword]
  );
  return result.rows[0];
};

const isUserExists = async (username, email) => {
  const result = await pool.query(
    'SELECT 1 FROM users WHERE username = $1 OR email = $2',
    [username, email]
  );
  return result.rowCount > 0;
};

module.exports = {
  findUserByUsernameOrEmail,
  createUser,
  isUserExists
};
