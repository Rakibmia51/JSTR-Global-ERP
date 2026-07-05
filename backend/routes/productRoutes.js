const express = require('express');
const router = express.Router();

// Destructuring the specific middleware from your combined upload file
const { protect, authorizeRoles } = require('../middleware/authMiddleware.js');
const { createProduct, getAllProducts } = require('../controllers/productController.js');


// --- Routes Definition ---

// ১. Create Product (প্রোডাক্ট তৈরি করা)
router.post('/add', createProduct);

// ২. Get All Products (প্রোডাক্টের লিস্ট)
router.get('/', getAllProducts);




module.exports = router;
