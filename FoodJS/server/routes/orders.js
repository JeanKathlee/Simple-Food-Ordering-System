const express = require('express');
const { readJsonFromData } = require('../lib/readJson');

const router = express.Router();

router.get('/', (_req, res) => {
  const data = readJsonFromData('orders.json');
  res.json(data.orders || []);
});

module.exports = router;
