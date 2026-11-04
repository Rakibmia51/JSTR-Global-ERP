// const fs = require("fs");
// const path = require("path");
// const Company = require("../models/CompanyProfile.js");
// const { LOGO_DIR } = require("../middleware/companyProfileUpload.js");
// const { asyncHandler } = require("../utils/asyncHandler.js");

// const TOP_LEVEL = [
//   "name", "legalName", "industry", "size", "registrationNumber", "taxId",
//   "email", "phone", "website",
//   "currency", "timezone", "fiscalYearStartMonth", "setupStep",
// ];
// const ADDRESS = ["line1", "line2", "city", "state", "postalCode", "country"];

// // Whitelist fields and flatten address to dot-notation so partial saves
// // don't wipe the rest of the sub-document.
// function buildUpdate(body) {
//   const $set = {};
//   for (const k of TOP_LEVEL) if (body[k] !== undefined) $set[k] = body[k];
//   if (body.address && typeof body.address === "object") {
//     for (const k of ADDRESS)
//       if (body.address[k] !== undefined) $set[`address.${k}`] = body.address[k];
//   }
//   return $set;
// }

// function removeOldLogo(logoUrl) {
//   if (!logoUrl) return;
//   const file = path.join(LOGO_DIR, path.basename(logoUrl));
//   fs.unlink(file, () => {});
// }

// // GET /api/company/me: ওনার আইডি ফিল্টার ছাড়া প্রথম কোম্পানি প্রোফাইল নিয়ে আসবে
// const getMyCompany = asyncHandler(async (req, res) => {
//   // 🎯 ফিক্স: { owner: req.user._id } এর পরিবর্তে সরাসরি প্রথম ডকুমেন্টটি খুঁজবে
//   const company = await Company.findOne(); 
  
//   if (!company) {
//     return res.status(404).json({ success: false, message: "Company profile not found" });
//   }

//   res.json({ success: true, data: company });
// });


// // PUT /api/company/me: create or update (supports saving step by step)
// const saveMyCompany = asyncHandler(async (req, res) => {
//   const $set = buildUpdate(req.body);
//   const existing = await Company.findOne({ owner: req.user._id }).select("_id");
  
//   if (!existing && !$set.name) {
//     return res.status(400).json({
//       success: false,
//       message: "Validation failed",
//       errors: { name: "Company name is required" },
//     });
//   }
  
//   // আপডেট করা হয়েছে: { new: true } এর বদলে { returnDocument: "after" } ব্যবহার করা হয়েছে
//   const company = await Company.findOneAndUpdate(
//     { owner: req.user._id },
//     { $set, $setOnInsert: { owner: req.user._id } },
//     { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true }
//   );
  
//   res.json({ success: true, data: company });
// });

// // POST /api/company/me/logo: runs after the multer middleware in the route
// const uploadMyLogo = asyncHandler(async (req, res) => {
//   if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  
//   const company = await Company.findOne({ owner: req.user._id });
//   if (!company) {
//     fs.unlink(req.file.path, () => {});
//     return res
//       .status(400)
//       .json({ success: false, message: "Save company basics before uploading a logo" });
//   }
  
//   removeOldLogo(company.logoUrl);
//   company.logoUrl = `/uploads/logos/${req.file.filename}`;
//   await company.save();
  
//   res.json({ success: true, message: "Logo uploaded successfully!", logoUrl: company.logoUrl, data: company });
// });

// // DELETE /api/company/me/logo
// const deleteMyLogo = asyncHandler(async (req, res) => {
//   const company = await Company.findOne({ owner: req.user._id });
//   if (!company) return res.status(404).json({ success: false, message: "Company not found" });
  
//   removeOldLogo(company.logoUrl);
//   company.logoUrl = "";
//   await company.save();
  
//   res.json({ success: true, message: "Logo removed successfully.", data: company });
// });

// // POST /api/company/me/complete: mark setup as complete
// const completeMySetup = asyncHandler(async (req, res) => {
//   const company = await Company.findOne({ owner: req.user._id });
//   if (!company) return res.status(404).json({ success: false, message: "Company not found" });
  
//   if (!company.email || !company.address?.country) {
//     return res.status(400).json({
//       success: false,
//       message: "Add a contact email and country before finishing setup",
//     });
//   }
  
//   company.setupCompleted = true;
//   company.setupStep = 4;
//   await company.save();
  
//   res.json({ success: true, message: "Congratulations! Your company setup is complete.", data: company });
// });

// // CommonJS এক্সপোর্ট
// module.exports = {
//   getMyCompany,
//   saveMyCompany,
//   uploadMyLogo,
//   deleteMyLogo,
//   completeMySetup,
// };


// 2nd Attempt at Company Profile Controller with improved validation and error handling
const fs = require("fs");
const path = require("path");
const Company = require("../models/CompanyProfile.js");
const { LOGO_DIR } = require("../middleware/companyProfileUpload.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const TOP_LEVEL = [
  "name", "legalName", "industry", "size", "registrationNumber", "taxId",
  "email", "phone", "website",
  "currency", "timezone", "fiscalYearStartMonth", "setupStep",
];
const ADDRESS = ["line1", "line2", "city", "state", "postalCode", "country"];
const SISTER_ADDRESS = ["line1", "line2", "city", "state", "postalCode", "country"];

// Whitelist fields and flatten address to dot-notation so partial saves
// don't wipe the rest of the sub-document.
function buildUpdate(body) {
  const $set = {};
  for (const k of TOP_LEVEL) if (body[k] !== undefined) $set[k] = body[k];
  if (body.address && typeof body.address === "object") {
    for (const k of ADDRESS)
      if (body.address[k] !== undefined) $set[`address.${k}`] = body.address[k];
  }
  return $set;
}

function removeOldLogo(logoUrl) {
  if (!logoUrl) return;
  const file = path.join(LOGO_DIR, path.basename(logoUrl));
  fs.unlink(file, () => {});
}

// GET /api/company/me: ওনার আইডি ফিল্টার ছাড়া প্রথম কোম্পানি প্রোফাইল নিয়ে আসবে
const getMyCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOne(); 
  
  if (!company) {
    return res.status(404).json({ success: false, message: "Company profile not found" });
  }

  res.json({ success: true, data: company });
});

// PUT /api/company/me: create or update (supports saving step by step)
const saveMyCompany = asyncHandler(async (req, res) => {
  const $set = buildUpdate(req.body);
  const existing = await Company.findOne({ owner: req.user._id }).select("_id");
  
  if (!existing && !$set.name) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: { name: "Company name is required" },
    });
  }
  
  const company = await Company.findOneAndUpdate(
    { owner: req.user._id },
    { $set, $setOnInsert: { owner: req.user._id } },
    { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  
  res.json({ success: true, data: company });
});

// POST /api/company/me/logo: runs after the multer middleware in the route
const uploadMyLogo = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  
  const company = await Company.findOne({ owner: req.user._id });
  if (!company) {
    fs.unlink(req.file.path, () => {});
    return res
      .status(400)
      .json({ success: false, message: "Save company basics before uploading a logo" });
  }
  
  removeOldLogo(company.logoUrl);
  company.logoUrl = `/uploads/logos/${req.file.filename}`;
  await company.save();
  
  res.json({ success: true, message: "Logo uploaded successfully!", logoUrl: company.logoUrl, data: company });
});

// DELETE /api/company/me/logo
const deleteMyLogo = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ owner: req.user._id });
  if (!company) return res.status(404).json({ success: false, message: "Company not found" });
  
  removeOldLogo(company.logoUrl);
  company.logoUrl = "";
  await company.save();
  
  res.json({ success: true, message: "Logo removed successfully.", data: company });
});

// POST /api/company/me/complete: mark setup as complete
const completeMySetup = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ owner: req.user._id });
  if (!company) return res.status(404).json({ success: false, message: "Company not found" });
  
  if (!company.email || !company.address?.country) {
    return res.status(400).json({
      success: false,
      message: "Add a contact email and country before finishing setup",
    });
  }
  
  company.setupCompleted = true;
  company.setupStep = 4;
  await company.save();
  
  res.json({ success: true, message: "Congratulations! Your company setup is complete.", data: company });
});

// ==========================================================
// 🤝 NEW: Sister Concern (সহযোগী প্রতিষ্ঠান) Controller Methods
// ==========================================================

// POST /api/company/me/sister-concerns: নতুন সহযোগী প্রতিষ্ঠান যোগ করা
const addSisterConcern = asyncHandler(async (req, res) => {
  const { name, legalName, industry, registrationNumber, taxId, email, phone, website, logoUrl, address, isPrimary } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: "Sister concern name is required" });
  }

  const company = await Company.findOne({ owner: req.user._id });
  if (!company) return res.status(404).json({ success: false, message: "Main company profile not found" });

  const newConcern = {
    name,
    legalName,
    industry,
    registrationNumber,
    taxId,
    email,
    phone,
    website,
    logoUrl,
    address,
    isPrimary: !!isPrimary,
  };

  company.sisterConcerns.push(newConcern);
  await company.save();

  res.status(201).json({
    success: true,
    message: "Sister concern added successfully",
    data: company,
  });
});

// PUT /api/company/me/sister-concerns/:concernId: সহযোগী প্রতিষ্ঠান আপডেট করা
const updateSisterConcern = asyncHandler(async (req, res) => {
  const { concernId } = req.params;
  const company = await Company.findOne({ owner: req.user._id });

  if (!company) return res.status(404).json({ success: false, message: "Company profile not found" });

  const concern = company.sisterConcerns.id(concernId);
  if (!concern) {
    return res.status(404).json({ success: false, message: "Sister concern not found" });
  }

  // Fields mapping
  const fields = ["name", "legalName", "industry", "registrationNumber", "taxId", "email", "phone", "website", "logoUrl", "isPrimary"];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) concern[field] = req.body[field];
  });

  if (req.body.address && typeof req.body.address === "object") {
    SISTER_ADDRESS.forEach((k) => {
      if (req.body.address[k] !== undefined) concern.address[k] = req.body.address[k];
    });
  }

  await company.save();

  res.json({
    success: true,
    message: "Sister concern updated successfully",
    data: company,
  });
});

// DELETE /api/company/me/sister-concerns/:concernId: সহযোগী প্রতিষ্ঠান মুছে ফেলা
const deleteSisterConcern = asyncHandler(async (req, res) => {
  const { concernId } = req.params;
  const company = await Company.findOne({ owner: req.user._id });

  if (!company) return res.status(404).json({ success: false, message: "Company profile not found" });

  // Mongoose Array Pull Method
  company.sisterConcerns.pull({ _id: concernId });
  await company.save();

  res.json({
    success: true,
    message: "Sister concern removed successfully",
    data: company,
  });
});

// POST /api/company/me/sister-concern-logo: শুধুমাত্র সিস্টার কনসার্নের লোগো আপলোড করার জন্য
const uploadSisterConcernLogo = asyncHandler(async (req, res) => {
  //console.log("Backend Received File:", req.file); // এখানে ফাইল অবজেক্ট প্রিন্ট হবে
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  const logoUrl = `/uploads/logos/${req.file.filename}`;
  res.json({ success: true, message: "Logo uploaded successfully", logoUrl });
});


// CommonJS এক্সপোর্ট
module.exports = {
  getMyCompany,
  saveMyCompany,
  uploadMyLogo,
  deleteMyLogo,
  completeMySetup,
  addSisterConcern,
  updateSisterConcern,
  deleteSisterConcern,
  uploadSisterConcernLogo
};