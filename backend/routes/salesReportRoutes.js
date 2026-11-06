const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {getDetailedInvoiceReport, getDealerStatementByCode, getStaffMonthlyStatement } = require('../controllers/salesReportController');

// @route   GET /api/reports/detailed-invoices
// @desc    Get detailed invoice report with date filters and partner org support
// @access  Private (Admin / Accounts)
router.get(
  '/detailed-invoices',
  protect,
  authorizeRoles('admin', 'accounts'),
  getDetailedInvoiceReport
);
  
router.get(
  '/dealer-statement/code/:code',
  protect,
  authorizeRoles('admin', 'accounts'),
  getDealerStatementByCode
);

router.get(
  '/staff-statement/:idNo',
  protect,
  authorizeRoles('admin', 'accounts'),
  getStaffMonthlyStatement
);

module.exports = router;