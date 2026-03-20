const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function readJsonFromData(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContent);
}

module.exports = {
  readJsonFromData,
};
