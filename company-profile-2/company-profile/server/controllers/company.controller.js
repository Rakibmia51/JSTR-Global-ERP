import fs from "fs";
import path from "path";
import Company from "../models/Company.js";
import { LOGO_DIR } from "../middleware/upload.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const TOP_LEVEL = [
  "name", "legalName", "industry", "size", "registrationNumber", "taxId",
  "email", "phone", "website",
  "currency", "timezone", "fiscalYearStartMonth", "setupStep",
];
const ADDRESS = ["line1", "line2", "city", "state", "postalCode", "country"];

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

// GET /api/company/me: current company profile (null if not created yet)
export const getMyCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ owner: req.userId });
  res.json({ company });
});

// PUT /api/company/me: create or update (supports saving step by step)
export const saveMyCompany = asyncHandler(async (req, res) => {
  const $set = buildUpdate(req.body);
  const existing = await Company.findOne({ owner: req.userId }).select("_id");
  if (!existing && !$set.name) {
    return res.status(400).json({
      message: "Validation failed",
      errors: { name: "Company name is required" },
    });
  }
  const company = await Company.findOneAndUpdate(
    { owner: req.userId },
    { $set, $setOnInsert: { owner: req.userId } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  res.json({ company });
});

// POST /api/company/me/logo: runs after the multer middleware in the route
export const uploadMyLogo = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const company = await Company.findOne({ owner: req.userId });
  if (!company) {
    fs.unlink(req.file.path, () => {});
    return res
      .status(400)
      .json({ message: "Save company basics before uploading a logo" });
  }
  removeOldLogo(company.logoUrl);
  company.logoUrl = `/uploads/logos/${req.file.filename}`;
  await company.save();
  res.json({ company });
});

// DELETE /api/company/me/logo
export const deleteMyLogo = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ owner: req.userId });
  if (!company) return res.status(404).json({ message: "Company not found" });
  removeOldLogo(company.logoUrl);
  company.logoUrl = "";
  await company.save();
  res.json({ company });
});

// POST /api/company/me/complete: mark setup as complete
export const completeMySetup = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ owner: req.userId });
  if (!company) return res.status(404).json({ message: "Company not found" });
  if (!company.email || !company.address?.country) {
    return res.status(400).json({
      message: "Add a contact email and country before finishing setup",
    });
  }
  company.setupCompleted = true;
  company.setupStep = 4;
  await company.save();
  res.json({ company });
});
