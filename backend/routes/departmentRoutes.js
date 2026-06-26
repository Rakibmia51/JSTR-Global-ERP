const express = require('express');
const router = express.Router();
const { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // যদি সুরক্ষিত করতে চান

// সর্বসাধারণ বা লগইন করা ইউজাররা দেখতে পারবে, কিন্তু ক্রিয়েট শুধু অ্যাডমিন পারবে
router.get('/', protect, authorizeRoles("admin"), getAllDepartments);
router.post('/', protect, authorizeRoles('admin'), createDepartment);

router.put('/:id', protect, authorizeRoles('admin'), updateDepartment);
router.delete('/delete/:id', protect, authorizeRoles('admin'), deleteDepartment);


module.exports = router;
