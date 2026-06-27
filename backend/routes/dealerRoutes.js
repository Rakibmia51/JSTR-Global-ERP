const express = require('express');
const router = express.Router();

// Destructuring the specific middleware from your combined upload file
const { protect, authorizeRoles } = require('../middleware/authMiddleware.js');
const dealerUpload  = require('../middleware/uploadMiddleware.js'); 
const { registerDealer, getDealers } = require('../controllers/dealerController.js');

// --- Routes Definition ---
router.post('/register',dealerUpload, registerDealer);

router.get('/', getDealers);


module.exports = router;
