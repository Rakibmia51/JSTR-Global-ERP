const express = require('express');
const router = express.Router();

// Destructuring the specific middleware from your combined upload file
const { protect, authorizeRoles } = require('../middleware/authMiddleware.js');
const { updateEmployeeRankByAdmin } = require('../controllers/rankUpdateController.js');



// --- Routes Definition ---
router.put("/update", updateEmployeeRankByAdmin);






module.exports = router;