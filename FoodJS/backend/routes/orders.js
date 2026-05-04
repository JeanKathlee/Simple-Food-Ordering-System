const express = require('express');
const { readJsonFromData } = require('../lib/readJson');
const { writeJsonToData } = require('../lib/writeJson');
const { verifyToken } = require('../middleware/auth');

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

// GET - get all orders para sa logged-in user
router.get('/', verifyToken, (req, res) => {
  const userId = req.user.sub;
  const data = readJsonFromData('orders.json');
  
  const userOrders = (data.orders || []).filter(order => order.userId === userId);
  res.json(userOrders);
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
  const { items, customerName, paymentMethod } = req.body || {};
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Items are required.' });
  }
  
  if (!customerName) {
    return res.status(400).json({ message: 'Customer name is required.' });
  }
  
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const newOrder = {
    id: getNextOrderId(),
    userId,
    customerName,
    items,
    total,
    paymentMethod: paymentMethod || 'cash',
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const data = readJsonFromData('orders.json');
  data.orders.push(newOrder);
  writeJsonToData('orders.json', data);
  
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
  
  if (order.status === 'Delivered' || order.status === 'Cancelled') {
    return res.status(400).json({ message: `Cannot cancel order with status: ${order.status}` });
  }
  
  order.status = 'Cancelled';
  order.updatedAt = new Date().toISOString();
  
  writeJsonToData('orders.json', data);
  res.json(order);
});

// PATCH - Update order status para admin only
router.patch('/:id/status', verifyToken, (req, res) => {
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
  
  order.status = status;
  order.updatedAt = new Date().toISOString();
  
  writeJsonToData('orders.json', data);
  res.json(order);
});

module.exports = router;
