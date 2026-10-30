const mongoose = require("mongoose");

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[+()\-\s\d]{6,20}$/;
const urlRe = /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i;

const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, trim: true, maxlength: 120 },
    line2: { type: String, trim: true, maxlength: 120 },
    city: { type: String, trim: true, maxlength: 80 },
    state: { type: String, trim: true, maxlength: 80 },
    postalCode: { type: String, trim: true, maxlength: 20 },
    country: { type: String, trim: true, maxlength: 80 },
  },
  { _id: false }
);

const companySchema = new mongoose.Schema(
  {
    // One company profile per owner
    owner: { type: String, required: true, unique: true, index: true },

    // Step 1: Basics
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      minlength: [2, "Company name is too short"],
      maxlength: 120,
    },
    legalName: { type: String, trim: true, maxlength: 160 },
    industry: { type: String, trim: true, maxlength: 80 },
    size: {
      type: String,
      enum: {
        values: ["1-10", "11-50", "51-200", "201-500", "500+", ""],
        message: "Invalid company size",
      },
    },
    registrationNumber: { type: String, trim: true, maxlength: 60 },
    taxId: { type: String, trim: true, maxlength: 60 },

    // Step 2: Contact & address
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v) => !v || emailRe.test(v),
        message: "Enter a valid email address",
      },
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || phoneRe.test(v),
        message: "Enter a valid phone number",
      },
    },
    website: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || urlRe.test(v),
        message: "Website must start with http:// or https://",
      },
    },
    address: { type: addressSchema, default: () => ({}) },

    // Step 3: Branding & preferences
    logoUrl: { type: String, default: "" },
    currency: { type: String, default: "BDT", uppercase: true, maxlength: 3 },
    timezone: { type: String, default: "Asia/Dhaka" },
    fiscalYearStartMonth: { type: Number, min: 1, max: 12, default: 1 },

    // Wizard progress
    setupStep: { type: Number, default: 1, min: 1, max: 4 },
    setupCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// CommonJS এক্সপোর্ট (কন্ট্রোলারের ইম্পোর্টের সাথে মিল রেখে 'CompanyProfile' নাম দেওয়া হলো)
module.exports = mongoose.model("CompanyProfile", companySchema);
