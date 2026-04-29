const express = require('express');
const { readJsonFromData } = require('../lib/readJson');

const router = express.Router();

router.get('/', (_req, res) => {
  const data = readJsonFromData('admin-insights.json');
  res.json(data);
});

module.exports = router;
