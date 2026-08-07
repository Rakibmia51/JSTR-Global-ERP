const express = require('express');
const router = express.Router();

// Destructuring the specific middleware from your combined upload file
const { protect, authorizeRoles } = require('../middleware/authMiddleware.js');
const { 
    getSalesWithEmployee , 
    archiveMonthlySales, 
    getEmployeeDashboardStats, 
    getEmployeeMonthWiseSales,
    getTeamInvoicesInvoiceWise

} = require('../controllers/salesController.js');


// --- Routes Definition ---


// ১. Get Sales with Employee Info (ডিলার এবং এমপ্লয়ি ইনফো সহ সেলস ডাটা)
router.get('/', getSalesWithEmployee);


// 🔒 ম্যানুয়াল আর্কাইভ ট্রিগার করার নতুন রুট
router.post('/archive-monthly', archiveMonthlySales);

// এপিআই এন্ডপয়েন্ট: GET /api/dashboard/stats?year=2026&month=8
router.get('/stats', getEmployeeDashboardStats);

// এপিআই এন্ডপয়েন্ট: GET /api/sales/my-monthly-sales?year=2026&month=8
router.get('/my-monthly-sales', getEmployeeMonthWiseSales);



router.get('/team-invoices-log', getTeamInvoicesInvoiceWise);


module.exports = router;
