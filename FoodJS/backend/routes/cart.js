const express = require('express');
const { readJsonFromData } = require('../lib/readJson');
const { writeJsonToData } = require('../lib/writeJson');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET - user's cart items
router.get('/', verifyToken, (req, res) => {
  const userId = req.user.sub;
  const data = readJsonFromData('cart-items.json');
  
  const userCart = (data.cartItems || []).filter(item => item.userId === userId);
  res.json(userCart);
});

// POST - Add item sa cart
router.post('/items', verifyToken, (req, res) => {
  const userId = req.user.sub;
  const { menuItemId, name, price, quantity, selectedChoice } = req.body || {};

  if (!menuItemId || !name || price === undefined || !quantity) {
    return res.status(400).json({ message: 'menuItemId, name, price, and quantity are required.' });
  }

  if (price <= 0 || quantity <= 0) {
    return res.status(400).json({ message: 'Price and quantity must be greater than 0.' });
  }

  const data = readJsonFromData('cart-items.json');

  // Check if item already in cart
  const existingIndex = (data.cartItems || []).findIndex(
    item => item.userId === userId && item.menuItemId === menuItemId
  );

  if (existingIndex !== -1) {
    data.cartItems[existingIndex].quantity += quantity;
    data.cartItems[existingIndex].updatedAt = new Date().toISOString();
  } else {
    data.cartItems.push({
      userId,
      menuItemId,
      name,
      price: Number(price),
      quantity: Number(quantity),
      selectedChoice: selectedChoice || null,
      updatedAt: new Date().toISOString(),
    });
  }

  writeJsonToData('cart-items.json', data);
  res.status(201).json({ message: 'Item added to cart.' });
});

// PATCH Update item quantity
router.patch('/items/:menuId', verifyToken, (req, res) => {
  const userId = req.user.sub;
  const { menuId } = req.params;
  const { quantity } = req.body || {};

  if (quantity === undefined) {
    return res.status(400).json({ message: 'Quantity is required.' });
  }

  if (quantity <= 0) {
    return res.status(400).json({ message: 'Quantity must be greater than 0.' });
  }

  const data = readJsonFromData('cart-items.json');
  const itemIndex = (data.cartItems || []).findIndex(
    item => item.userId === userId && item.menuItemId === menuId
  );

  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found in cart.' });
  }

  data.cartItems[itemIndex].quantity = Number(quantity);
  data.cartItems[itemIndex].updatedAt = new Date().toISOString();

  writeJsonToData('cart-items.json', data);
  res.json({ message: 'Cart item updated.' });
});

// DELETE - Remove item sa cart
router.delete('/items/:menuId', verifyToken, (req, res) => {
  const userId = req.user.sub;
  const { menuId } = req.params;

  const data = readJsonFromData('cart-items.json');
  const itemIndex = (data.cartItems || []).findIndex(
    item => item.userId === userId && item.menuItemId === menuId
  );

  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found in cart.' });
  }

  data.cartItems.splice(itemIndex, 1);
  writeJsonToData('cart-items.json', data);

  res.json({ message: 'Item removed from cart.' });
});

// DELETE - Clear tanan sa cart
router.delete('/', verifyToken, (req, res) => {
  const userId = req.user.sub;

  const data = readJsonFromData('cart-items.json');

  data.cartItems = (data.cartItems || []).filter(item => item.userId !== userId);
  writeJsonToData('cart-items.json', data);

  res.json({ message: 'Cart cleared.' });
});

module.exports = router;
