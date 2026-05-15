const express = require('express');
const { readJsonFromData } = require('../lib/readJson');
const { writeJsonToData } = require('../lib/writeJson');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

function getNextCategoryId() {
  const data = readJsonFromData('categories.json');
  const categories = data.categories || [];
  if (categories.length === 0) return 'cat-1001';
  
  const ids = categories.map(cat => {
    const num = parseInt(cat.id.split('-')[1]);
    return isNaN(num) ? 0 : num;
  });
  const maxNum = Math.max(...ids);
  return `cat-${maxNum + 1}`;
}

router.get('/', (_req, res) => {
  const data = readJsonFromData('categories.json');
  res.json(data.categories || []);
});

router.post('/', verifyToken, requireAdmin, (req, res) => {
  const { name, description } = req.body || {};

  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required.' });
  }

  const newCategory = {
    id: getNextCategoryId(),
    name: name.trim(),
    description: description.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const data = readJsonFromData('categories.json');
  data.categories.push(newCategory);
  writeJsonToData('categories.json', data);

  res.status(201).json(newCategory);
});

router.put('/:id', verifyToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body || {};

  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required.' });
  }

  const data = readJsonFromData('categories.json');
  const categoryIndex = (data.categories || []).findIndex(cat => cat.id === id);

  if (categoryIndex === -1) {
    return res.status(404).json({ message: 'Category not found.' });
  }

  data.categories[categoryIndex] = {
    ...data.categories[categoryIndex],
    name: name.trim(),
    description: description.trim(),
    updatedAt: new Date().toISOString(),
  };

  writeJsonToData('categories.json', data);
  res.json(data.categories[categoryIndex]);
});

router.delete('/:id', verifyToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  const data = readJsonFromData('categories.json');
  const categoryIndex = (data.categories || []).findIndex(cat => cat.id === id);

  if (categoryIndex === -1) {
    return res.status(404).json({ message: 'Category not found.' });
  }

  data.categories.splice(categoryIndex, 1);
  writeJsonToData('categories.json', data);

  res.json({ message: 'Category deleted successfully.' });
});

module.exports = router;
