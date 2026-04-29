const express = require('express');
const { readJsonFromData } = require('../lib/readJson');

const router = express.Router();

router.get('/', (_req, res) => {
  const data = readJsonFromData('categories.json');
  res.json(data.categories || []);
});

module.exports = router;
