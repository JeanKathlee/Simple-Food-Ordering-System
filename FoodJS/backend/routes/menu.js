const express = require('express');
const { readJsonFromData } = require('../lib/readJson');
const { writeJsonToData } = require('../lib/writeJson');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Generate menu id
function getNextMenuId() {
  const data = readJsonFromData('menu.json');
  const items = data.menu || [];
  if (items.length === 0) return 'M-1001';
  
  const ids = items.map(item => {
    const num = parseInt(item.id.split('-')[1]);
    return isNaN(num) ? 0 : num;
  });
  const maxNum = Math.max(...ids);
  return `M-${maxNum + 1}`;
}

// Get - Menu items
router.get('/', (_req, res) => {
  const data = readJsonFromData('menu.json');
  res.json(data.menu || []);
});

// POST - create new menu item, for admin ra
router.post('/', verifyToken, requireAdmin, (req, res) => {
  const { name, categoryId, price, prepTime, isAvailable, image, description } = req.body || {};

  // Validate ang input
  if (!name || !categoryId || !price || !prepTime) {
    return res.status(400).json({ message: 'Name, categoryId, price, and prepTime are required.' });
  }

  if (price <= 0 || prepTime <= 0) {
    return res.status(400).json({ message: 'Price and prepTime must be greater than 0.' });
  }

  // Read sa current menu
  const data = readJsonFromData('menu.json');
  const categories = readJsonFromData('categories.json');

  // Find category name
  const category = (categories.categories || []).find(c => c.id === categoryId);
  if (!category) {
    return res.status(400).json({ message: 'Invalid categoryId.' });
  }

  // Create new item
  const newItem = {
    id: getNextMenuId(),
    name,
    description: description || '',
    categoryId,
    category: category.name,
    price: Number(price),
    prepTime: Number(prepTime),
    isAvailable: isAvailable !== false,
    soldCount: 0,
    image: image || null, // Save base64 image if provided
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Add to menu
  data.menu.push(newItem);
  writeJsonToData('menu.json', data);

  res.status(201).json(newItem);
});

// PUT - Update menu item, para admin ra
router.put('/:id', verifyToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, categoryId, price, prepTime, isAvailable, image, description } = req.body || {};

  // Read sa current menu
  const data = readJsonFromData('menu.json');
  const itemIndex = (data.menu || []).findIndex(item => item.id === id);

  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Menu item not found.' });
  }

  // Validate input
  if (!name || !categoryId || price === undefined || prepTime === undefined) {
    return res.status(400).json({ message: 'Name, categoryId, price, and prepTime are required.' });
  }

  if (price <= 0 || prepTime <= 0) {
    return res.status(400).json({ message: 'Price and prepTime must be greater than 0.' });
  }

  // Validate category
  const categories = readJsonFromData('categories.json');
  const category = (categories.categories || []).find(c => c.id === categoryId);
  if (!category) {
    return res.status(400).json({ message: 'Invalid categoryId.' });
  }

  // Update item 
  const oldItem = data.menu[itemIndex];
  data.menu[itemIndex] = {
    ...oldItem,
    name,
    description: description !== undefined ? description : oldItem.description,
    categoryId,
    category: category.name,
    price: Number(price),
    prepTime: Number(prepTime),
    isAvailable: isAvailable !== false,
    image: image !== undefined ? image : oldItem.image, // Keep old image if not provided
    updatedAt: new Date().toISOString(),
  };

  writeJsonToData('menu.json', data);
  res.json(data.menu[itemIndex]);
});

// DELETE - delete menu item, para admin 
router.delete('/:id', verifyToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  // Read current menu
  const data = readJsonFromData('menu.json');
  const itemIndex = (data.menu || []).findIndex(item => item.id === id);

  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Menu item not found.' });
  }

  // Remove item
  data.menu.splice(itemIndex, 1);
  writeJsonToData('menu.json', data);

  res.json({ message: 'Menu item deleted successfully.' });
});

module.exports = router;
