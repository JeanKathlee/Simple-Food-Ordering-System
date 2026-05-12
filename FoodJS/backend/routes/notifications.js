const express = require('express');
const { readJsonFromData } = require('../lib/readJson');
const { writeJsonToData } = require('../lib/writeJson');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, (req, res) => {
  const userId = req.user.sub;
  const data = readJsonFromData('notifications.json');

  const userNotifications = (data.notifications || [])
    .filter((notification) => notification.userId === userId && notification.channel === 'in-app')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(userNotifications);
});

router.patch('/:id/read', verifyToken, (req, res) => {
  const userId = req.user.sub;
  const { id } = req.params;
  const data = readJsonFromData('notifications.json');

  const notification = (data.notifications || []).find(
    (entry) => entry.id === id && entry.userId === userId && entry.channel === 'in-app'
  );

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found.' });
  }

  notification.read = true;
  notification.readAt = new Date().toISOString();

  writeJsonToData('notifications.json', data);
  res.json(notification);
});

module.exports = router;
