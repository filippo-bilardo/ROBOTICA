const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

let orders = [
  { id: 1, userId: 1, productId: 1, quantity: 2, status: 'pending', total: 1999.98 },
  { id: 2, userId: 2, productId: 2, quantity: 1, status: 'completed', total: 29.99 }
];

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'order-service',
    timestamp: new Date().toISOString()
  });
});

app.get('/orders', (req, res) => {
  const { userId, status } = req.query;
  let filteredOrders = orders;
  
  if (userId) filteredOrders = filteredOrders.filter(o => o.userId === parseInt(userId));
  if (status) filteredOrders = filteredOrders.filter(o => o.status === status);
  
  res.json({ orders: filteredOrders, total: filteredOrders.length });
});

app.get('/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

app.post('/orders', (req, res) => {
  const { userId, productId, quantity } = req.body;
  if (!userId || !productId || !quantity) {
    return res.status(400).json({ error: 'userId, productId, and quantity are required' });
  }

  const newOrder = {
    id: Math.max(...orders.map(o => o.id)) + 1,
    userId, productId, quantity,
    status: 'pending',
    total: quantity * 99.99, // Mock calculation
    createdAt: new Date().toISOString()
  };
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

app.listen(PORT, () => {
  console.log(`📦 Order Service running on port ${PORT}`);
});
