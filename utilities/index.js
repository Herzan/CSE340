const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// In-memory store for demo (orders)
const orders = [];

// GET index
app.get('/', (req, res) => {
  res.render('index', {
    pageTitle: 'CSE Motors',
    orders,
    formData: {},
    errors: []
  });
});

// POST /orders (handles form submission - supports JSON and urlencoded)
app.post('/orders', (req, res) => {
  const { name, email, model, quantity } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) errors.push('Please enter your name (min 2 chars).');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('Please enter a valid email.');
  if (!model || model.trim().length === 0) errors.push('Please select a model.');
  const qtyNum = Number(quantity);
  if (!quantity || isNaN(qtyNum) || qtyNum < 1) errors.push('Quantity must be 1 or more.');

  // if JSON request, return JSON
  if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
    if (errors.length) {
      return res.status(400).json({ success: false, errors });
    }
    const order = { id: Date.now(), name: name.trim(), email: email.trim(), model: model.trim(), quantity: qtyNum };
    orders.unshift(order);
    return res.json({ success: true, order });
  }

  // standard form POST
  if (errors.length) {
    return res.status(400).render('index', {
      pageTitle: 'CSE Motors',
      orders,
      formData: { name, email, model, quantity },
      errors
    });
  }

  const order = { id: Date.now(), name: name.trim(), email: email.trim(), model: model.trim(), quantity: qtyNum };
  orders.unshift(order);
  res.redirect('/');
});

// API endpoint to list orders
app.get('/api/orders', (req, res) => {
  res.json({ orders });
});

app.listen(PORT, () => {
  console.log(`CSE Motors running on http://localhost:${PORT}`);
});
