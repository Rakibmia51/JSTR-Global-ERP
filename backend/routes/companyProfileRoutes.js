// const express = require("express");
// const router = express.Router();

// // কন্ট্রোলার ফাংশনগুলো ইম্পোর্ট করা
// const {
//   getMyCompany,
//   saveMyCompany,
//   uploadMyLogo,
//   deleteMyLogo,
//   completeMySetup,
// } = require("../controllers/companyProfileController.js");

// // মাল্টার লোগো আপলোড মিডলওয়্যার ইম্পোর্ট করা
// const { uploadLogo } = require("../middleware/companyProfileUpload.js");

// // আপনার নিজস্ব অথেনটিকেশন মিডলওয়্যার ইম্পোর্ট করা (পাথ ঠিক করে নিবেন)
// const { protect, authorizeRoles } = require("../middleware/authMiddleware.js"); 

// // =========================================================================
// // কোম্পানি প্রোফাইল রাউটস (সবগুলো রাউট আপনার আসল protect মিডলওয়্যার দিয়ে প্রটেক্টেড)
// // =========================================================================

// // GET: বর্তমান লগইন থাকা ইউজারের কোম্পানির প্রোফাইল দেখা
// router.get("/me", protect,authorizeRoles("admin", "manager", "employee", "staff"), getMyCompany);

// // PUT: কোম্পানির বেসিক ইনফরমেশন তৈরি বা আপডেট করা
// router.put("/me", protect, authorizeRoles("admin"), saveMyCompany);

// // POST: কোম্পানির লোগো আপলোড করা
// router.post("/me/logo", protect, authorizeRoles("admin"), uploadLogo, uploadMyLogo);

// // DELETE: কোম্পানির লোগো রিমুভ বা ডিলিট করা
// router.delete("/me/logo", protect, authorizeRoles("admin"), deleteMyLogo);

// // POST: কোম্পানির প্রাথমিক সেটআপ সম্পূর্ণ হিসেবে মার্ক করা
// router.post("/me/complete", protect, authorizeRoles("admin"), completeMySetup);

// module.exports = router;


// 2nd Attempt: Using Express Router with TypeScript-like structure for better type safety and clarity
const express = require("express");
const router = express.Router();

// কন্ট্রোলার ফাংশনগুলো ইম্পোর্ট করা (নতুন ফাংশনগুলোসহ)
const {
  getMyCompany,
  saveMyCompany,
  uploadMyLogo,
  deleteMyLogo,
  completeMySetup,
  addSisterConcern,
  updateSisterConcern,
  deleteSisterConcern,
  uploadSisterConcernLogo
} = require("../controllers/companyProfileController.js");

// মাল্টার লোগো আপলোড মিডলওয়্যার ইম্পোর্ট করা
const { uploadLogo } = require("../middleware/companyProfileUpload.js");

// আপনার নিজস্ব অথেনটিকেশন মিডলওয়্যার ইম্পোর্ট করা (পাথ ঠিক করে নিবেন)
const { protect, authorizeRoles } = require("../middleware/authMiddleware.js"); 

// =========================================================================
// কোম্পানি প্রোফাইল রাউটস (সবগুলো রাউট আপনার আসল protect মিডলওয়্যার দিয়ে প্রটেক্টেড)
// =========================================================================

// GET: বর্তমান লগইন থাকা ইউজারের কোম্পানির প্রোফাইল দেখা
// router.get("/me", protect, authorizeRoles("admin", "manager", "employee", "staff"), getMyCompany);
router.get("/me", getMyCompany);
// PUT: কোম্পানির বেসিক ইনফরমেশন তৈরি বা আপডেট করা
router.put("/me", protect, authorizeRoles("admin"), saveMyCompany);

// POST: কোম্পানির লোগো আপলোড করা
router.post("/me/logo", protect, authorizeRoles("admin"), uploadLogo, uploadMyLogo);

// DELETE: কোম্পানির লোগো রিমুভ বা ডিলিট করা
router.delete("/me/logo", protect, authorizeRoles("admin"), deleteMyLogo);

// POST: কোম্পানির প্রাথমিক সেটআপ সম্পূর্ণ হিসেবে মার্ক করা
router.post("/me/complete", protect, authorizeRoles("admin"), completeMySetup);

// =========================================================================
// 🤝 Sister Concerns (সহযোগী প্রতিষ্ঠান) রাউটস
// =========================================================================

// POST: নতুন সহযোগী প্রতিষ্ঠান যোগ করা
router.post("/me/sister-concerns", protect, authorizeRoles("admin"), addSisterConcern);

// POST: সহযোগী প্রতিষ্ঠানের লোগো আপলোড করা
router.post("/me/sister-concern-logo", protect, authorizeRoles("admin"),uploadLogo, uploadSisterConcernLogo);

// PUT: নির্দিষ্ট সহযোগী প্রতিষ্ঠান আপডেট করা (concernId পাস করতে হবে)
router.put("/me/sister-concerns/:concernId", protect, authorizeRoles("admin"), updateSisterConcern);

// DELETE: নির্দিষ্ট সহযোগী প্রতিষ্ঠান মুছে ফেলা (concernId পাস করতে হবে)
router.delete("/me/sister-concerns/:concernId", protect, authorizeRoles("admin"), deleteSisterConcern);

module.exports = router;
