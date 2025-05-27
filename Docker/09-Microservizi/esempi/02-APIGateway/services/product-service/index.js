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

let products = [
  { id: 1, name: 'Laptop', price: 999.99, category: 'electronics', stock: 50 },
  { id: 2, name: 'Mouse', price: 29.99, category: 'electronics', stock: 200 },
  { id: 3, name: 'Keyboard', price: 79.99, category: 'electronics', stock: 150 }
];

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'product-service',
    timestamp: new Date().toISOString()
  });
});

app.get('/products', (req, res) => {
  const { category, limit = 10 } = req.query;
  let filteredProducts = category ? 
    products.filter(p => p.category === category) : 
    products;
  
  res.json({
    products: filteredProducts.slice(0, parseInt(limit)),
    total: filteredProducts.length
  });
});

app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

app.post('/products', (req, res) => {
  const { name, price, category, stock } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  const newProduct = {
    id: Math.max(...products.map(p => p.id)) + 1,
    name, price, category, stock: stock || 0
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.listen(PORT, () => {
  console.log(`🛍️ Product Service running on port ${PORT}`);
});
