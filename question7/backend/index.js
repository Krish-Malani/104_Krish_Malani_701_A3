require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopping_cart_db';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB (shopping_cart_db)!');
    await seedDemoDataIfEmpty();
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err.message);
  });

async function seedDemoDataIfEmpty() {
  try {
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('Seeding initial 2-level categories and demo products...');

      const electronics = await Category.create({ name: 'Electronics', parentCategory: null });
      const fashion = await Category.create({ name: 'Fashion & Apparel', parentCategory: null });
      const home = await Category.create({ name: 'Home & Kitchen', parentCategory: null });

      const laptops = await Category.create({ name: 'Laptops', parentCategory: electronics._id });
      const mobiles = await Category.create({ name: 'Smartphones', parentCategory: electronics._id });
      const audio = await Category.create({ name: 'Headphones', parentCategory: electronics._id });

      const mens = await Category.create({ name: "Men's Clothing", parentCategory: fashion._id });
      const womens = await Category.create({ name: "Women's Clothing", parentCategory: fashion._id });

      const kitchenAppliances = await Category.create({ name: 'Kitchen Appliances', parentCategory: home._id });

      await Product.create([
        {
          name: 'MacBook Air M2',
          description: 'Apple M2 chip, 8GB RAM, 256GB SSD, 13.6-inch Liquid Retina Display',
          price: 99999,
          stock: 15,
          mainCategory: electronics._id,
          subCategory: laptops._id,
          imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300'
        },
        {
          name: 'Dell XPS 15',
          description: 'Intel Core i7 13th Gen, 16GB RAM, 512GB SSD, OLED Touch',
          price: 135000,
          stock: 8,
          mainCategory: electronics._id,
          subCategory: laptops._id,
          imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=300'
        },
        {
          name: 'iPhone 15 Pro',
          description: 'Titanium design, A17 Pro chip, 48MP camera, 128GB Storage',
          price: 119900,
          stock: 20,
          mainCategory: electronics._id,
          subCategory: mobiles._id,
          imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300'
        },
        {
          name: 'Sony WH-1000XM5',
          description: 'Wireless Noise-Canceling Over-Ear Headphones, 30hr battery',
          price: 26990,
          stock: 25,
          mainCategory: electronics._id,
          subCategory: audio._id,
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'
        },
        {
          name: 'Casual Slim Fit Shirt',
          description: '100% Breathable Cotton Full Sleeve Formal & Casual Shirt',
          price: 1499,
          stock: 50,
          mainCategory: fashion._id,
          subCategory: mens._id,
          imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300'
        },
        {
          name: 'Floral Print Maxi Dress',
          description: 'Elegant A-line floral print summer evening dress',
          price: 2499,
          stock: 30,
          mainCategory: fashion._id,
          subCategory: womens._id,
          imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300'
        },
        {
          name: 'Electric Blender & Mixer',
          description: '750W Heavy duty stainless steel blender with 3 jars',
          price: 3299,
          stock: 12,
          mainCategory: home._id,
          subCategory: kitchenAppliances._id,
          imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=300'
        }
      ]);

      console.log('Sample 2-level categories and products seeded successfully!');
    }
  } catch (seedErr) {
    console.error('Error seeding demo data:', seedErr);
  }
}

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().populate('parentCategory', 'name');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/categories/main', async (req, res) => {
  try {
    const mainCategories = await Category.find({ parentCategory: null }).sort({ name: 1 });
    res.json(mainCategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/categories/sub/:parentId', async (req, res) => {
  try {
    const subCategories = await Category.find({ parentCategory: req.params.parentId }).sort({ name: 1 });
    res.json(subCategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', async (req, res) => {
  const { name, parentCategory } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    const category = new Category({
      name: name.trim(),
      parentCategory: parentCategory ? parentCategory : null
    });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await Category.deleteMany({ parentCategory: req.params.id });
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products', async (req, res) => {
  const { mainCategory, subCategory } = req.query;
  const filter = {};

  if (mainCategory) filter.mainCategory = mainCategory;
  if (subCategory) filter.subCategory = subCategory;

  try {
    const products = await Product.find(filter)
      .populate('mainCategory', 'name')
      .populate('subCategory', 'name')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('mainCategory', 'name')
      .populate('subCategory', 'name');

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, description, price, stock, mainCategory, subCategory, imageUrl } = req.body;

  if (!name || !price || !mainCategory || !subCategory) {
    return res.status(400).json({ error: 'Name, price, main category, and subcategory are required.' });
  }

  try {
    const product = new Product({
      name: name.trim(),
      description: description ? description.trim() : '',
      price: parseFloat(price),
      stock: parseInt(stock, 10) || 0,
      mainCategory,
      subCategory,
      imageUrl: imageUrl ? imageUrl.trim() : ''
    });

    await product.save();
    const populated = await Product.findById(product._id)
      .populate('mainCategory', 'name')
      .populate('subCategory', 'name');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { name, description, price, stock, mainCategory, subCategory, imageUrl } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (name) product.name = name.trim();
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) product.price = parseFloat(price);
    if (stock !== undefined) product.stock = parseInt(stock, 10);
    if (mainCategory) product.mainCategory = mainCategory;
    if (subCategory) product.subCategory = subCategory;
    if (imageUrl !== undefined) product.imageUrl = imageUrl.trim();

    await product.save();
    const updated = await Product.findById(product._id)
      .populate('mainCategory', 'name')
      .populate('subCategory', 'name');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  const { customerName, customerEmail, items, totalAmount } = req.body;

  if (!customerName || !customerEmail || !items || items.length === 0) {
    return res.status(400).json({ error: 'Customer name, email, and at least one item are required.' });
  }

  try {
    const order = new Order({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      items,
      totalAmount: parseFloat(totalAmount)
    });

    await order.save();

    for (const item of items) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity }
        });
      }
    }

    res.status(201).json({ message: 'Order placed successfully!', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, (err) => {
  if (err) {
    console.error('Failed to start Question 7 backend:', err);
  } else {
    console.log(`Question 7 Shopping Cart API running at http://localhost:${PORT}`);
  }
});
