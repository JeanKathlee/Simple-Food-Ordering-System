require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const menuRouter = require('./routes/menu');
const ordersRouter = require('./routes/orders');
const usersRouter = require('./routes/users');
const categoriesRouter = require('./routes/categories');
const adminInsightsRouter = require('./routes/adminInsights');
const cartRouter = require('./routes/cart');
const couponsRouter = require('./routes/coupons');
const notificationsRouter = require('./routes/notifications');
const authRouter = require('./routes/auth');

app.use('/api/menu', menuRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/admin-insights', adminInsightsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/auth', authRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'FoodJS API',
    environment: process.env.NODE_ENV || 'development',
  });
});

app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.resolve(__dirname, '../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => console.log(`FoodJS running on port ${PORT}`));
