const express = require('express');
const { readJsonFromData } = require('../lib/readJson');
const { writeJsonToData } = require('../lib/writeJson');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Generate order ID
function getNextOrderId() {
  const data = readJsonFromData('orders.json');
  const orders = data.orders || [];
  if (orders.length === 0) return 'O-1001';
  
  const ids = orders.map(order => {
    const num = parseInt(order.id.split('-')[1]);
    return isNaN(num) ? 0 : num;
  });
  const maxNum = Math.max(...ids);
  return `O-${maxNum + 1}`;
}

function getNextNotificationId(notifications = []) {
  if (notifications.length === 0) return 1001;

  const ids = notifications.map((notification) => {
    const num = parseInt(String(notification.id || '').split('-')[1], 10);
    return Number.isNaN(num) ? 0 : num;
  });

  return Math.max(...ids) + 1;
}

function recordStatusNotification(order, nextStatus) {
  try {
    const notificationData = readJsonFromData('notifications.json');
    const notifications = notificationData.notifications || [];
    const nextId = getNextNotificationId(notifications);
    const timestamp = new Date().toISOString();

    const userData = readJsonFromData('users.json');
    const user = (userData.users || []).find((entry) => entry.id === order.userId);
    const email = user?.email || 'unknown';

    const message = `Order ${order.id} status updated to ${nextStatus}.`;

    notifications.push({
      id: `N-${nextId}`,
      userId: order.userId,
      orderId: order.id,
      channel: 'in-app',
      title: 'Order status updated',
      message,
      status: nextStatus,
      read: false,
      createdAt: timestamp,
    });

    notifications.push({
      id: `N-${nextId + 1}`,
      userId: order.userId,
      orderId: order.id,
      channel: 'email',
      title: 'Order status updated',
      message,
      status: nextStatus,
      email,
      read: true,
      createdAt: timestamp,
    });

    writeJsonToData('notifications.json', { notifications });

    console.log(`[Email notification] to ${email}: ${message}`);
  } catch (err) {
    console.error('Failed to record notification:', err.message);
  }
}

// GET - get all orders para sa logged-in user
router.get('/', verifyToken, (req, res) => {
  const userId = req.user.sub;
  const data = readJsonFromData('orders.json');
  
  const userOrders = (data.orders || []).filter(order => order.userId === userId);
  res.json(userOrders);
});

// GET - get all orders admin onle
router.get('/admin/all', verifyToken, requireAdmin, (req, res) => {
  const data = readJsonFromData('orders.json');
  res.json(data.orders || []);
});

// GET - get specific order
router.get('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.sub;
  const data = readJsonFromData('orders.json');
  
  const order = (data.orders || []).find(o => o.id === id && o.userId === userId);
  
  if (!order) {
    return res.status(404).json({ message: 'Order not found.' });
  }
  
  res.json(order);
});

// POST - Create new order
router.post('/', verifyToken, (req, res) => {
  const userId = req.user.sub;
  const { items, customerName, paymentMethod, couponCode, discount } = req.body || {};
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Items are required.' });
  }
  
  if (!customerName) {
    return res.status(400).json({ message: 'Customer name is required.' });
  }
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal - (discount || 0);
  
  const newOrder = {
    id: getNextOrderId(),
    userId,
    customerName,
    items,
    subtotal,
    discount: discount || 0,
    total: Math.max(0, total),
    couponCode: couponCode || null,
    paymentMethod: paymentMethod || 'cash',
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const data = readJsonFromData('orders.json');
  data.orders.push(newOrder);
  writeJsonToData('orders.json', data);
  
  if (couponCode) {
    try {
      const couponsData = readJsonFromData('coupons.json');
      const coupon = couponsData.coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
      if (coupon) {
        coupon.usedCount += 1;
        writeJsonToData('coupons.json', couponsData);
      }
    } catch (err) {
    }
  }
  
  res.status(201).json(newOrder);
});

// PATCH - Cancel order paras pending or preparing orders only
router.patch('/:id/cancel', verifyToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.sub;
  const data = readJsonFromData('orders.json');
  
  const order = (data.orders || []).find(o => o.id === id && o.userId === userId);
  
  if (!order) {
    return res.status(404).json({ message: 'Order not found.' });
  }
  
  if (order.status === 'Delivered' || order.status === 'Completed' || order.status === 'Cancelled') {
    return res.status(400).json({ message: `Cannot cancel order with status: ${order.status}` });
  }
  
  order.status = 'Cancelled';
  order.updatedAt = new Date().toISOString();
  
  writeJsonToData('orders.json', data);
  recordStatusNotification(order, order.status);
  res.json(order);
});

// PATCH - Update order status para admin only
router.patch('/:id/status', verifyToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const data = readJsonFromData('orders.json');
  
  const order = (data.orders || []).find(o => o.id === id);
  
  if (!order) {
    return res.status(404).json({ message: 'Order not found.' });
  }
  
  if (!status) {
    return res.status(400).json({ message: 'Status is required.' });
  }

  if (order.status === status) {
    return res.json(order);
  }
  
  order.status = status;
  order.updatedAt = new Date().toISOString();
  
  writeJsonToData('orders.json', data);
  recordStatusNotification(order, order.status);
  res.json(order);
});

// DELETE - Delete order para admin only
router.delete('/:id', verifyToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const data = readJsonFromData('orders.json');
  
  const orderIndex = (data.orders || []).findIndex(o => o.id === id);
  
  if (orderIndex === -1) {
    return res.status(404).json({ message: 'Order not found.' });
  }
  
  // Remove sa order
  data.orders.splice(orderIndex, 1);
  writeJsonToData('orders.json', data);
  
  res.json({ message: 'Order deleted successfully.' });
});

module.exports = router;
