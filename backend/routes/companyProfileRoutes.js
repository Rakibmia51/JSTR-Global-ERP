const express = require("express");
const router = express.Router();

// কন্ট্রোলার ফাংশনগুলো ইম্পোর্ট করা
const {
  getMyCompany,
  saveMyCompany,
  uploadMyLogo,
  deleteMyLogo,
  completeMySetup,
} = require("../controllers/companyProfileController.js");

// মাল্টার লোগো আপলোড মিডলওয়্যার ইম্পোর্ট করা
const { uploadLogo } = require("../middleware/companyProfileUpload.js");

// আপনার নিজস্ব অথেনটিকেশন মিডলওয়্যার ইম্পোর্ট করা (পাথ ঠিক করে নিবেন)
const { protect } = require("../middleware/authMiddleware.js"); 

// =========================================================================
// কোম্পানি প্রোফাইল রাউটস (সবগুলো রাউট আপনার আসল protect মিডলওয়্যার দিয়ে প্রটেক্টেড)
// =========================================================================

// GET: বর্তমান লগইন থাকা ইউজারের কোম্পানির প্রোফাইল দেখা
router.get("/me", protect, getMyCompany);

// PUT: কোম্পানির বেসিক ইনফরমেশন তৈরি বা আপডেট করা
router.put("/me", protect, saveMyCompany);

// POST: কোম্পানির লোগো আপলোড করা
router.post("/me/logo", protect, uploadLogo, uploadMyLogo);

// DELETE: কোম্পানির লোগো রিমুভ বা ডিলিট করা
router.delete("/me/logo", protect, deleteMyLogo);

// POST: কোম্পানির প্রাথমিক সেটআপ সম্পূর্ণ হিসেবে মার্ক করা
router.post("/me/complete", protect, completeMySetup);

module.exports = router;
