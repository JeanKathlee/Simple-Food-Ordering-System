const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const menuRouter = require('./routes/menu');
const ordersRouter = require('./routes/orders');
const usersRouter = require('./routes/users');
const categoriesRouter = require('./routes/categories');
const adminInsightsRouter = require('./routes/adminInsights');

app.use('/api/menu', menuRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/admin-insights', adminInsightsRouter);

app.get('/', (_req, res) => {
  res.json({
    message: 'Simple Food Ordering API is running',
    environment: 'development',
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));