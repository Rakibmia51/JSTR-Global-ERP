const Product = require('../models/Product');
const mongoose = require('mongoose');

const createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}, '-__v').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// 🆕 ড্যাশবোর্ডে দেখানোর জন্য সব প্রোডাক্ট লিস্ট গেট করা
const getAllProductsForShowroom = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    
    // ডাটাবেজের প্রোডাক্ট কালেকশন থেকে সব ডাটা তুলে আনা
     const products = await db.collection("products").find({}).toArray();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error("Fetch Products Showroom Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



module.exports = { createProduct, getAllProducts, getAllProductsForShowroom };
