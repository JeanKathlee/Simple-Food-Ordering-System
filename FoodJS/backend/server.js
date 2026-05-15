require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

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