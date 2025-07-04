const fs = require('fs');
const path = require('path');

const readJSON = (filename) => {
  const filePath = path.join(__dirname, '../../', filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`${filename} not found`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

module.exports = {
  readJSON
};
