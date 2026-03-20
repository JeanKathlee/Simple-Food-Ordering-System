const express = require('express');
const { readJsonFromData } = require('../lib/readJson');

const router = express.Router();

router.get('/', (_req, res) => {
  const data = readJsonFromData('menu.json');
  res.json(data.menu || []);
});

module.exports = router;
