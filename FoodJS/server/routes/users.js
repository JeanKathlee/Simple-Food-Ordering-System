const express = require('express');
const { readJsonFromData } = require('../lib/readJson');

const router = express.Router();

router.get('/', (_req, res) => {
  const data = readJsonFromData('users.json');
  const safeUsers = (data.users || []).map(({ passwordHash, ...user }) => user);
  res.json(safeUsers);
});

module.exports = router;
