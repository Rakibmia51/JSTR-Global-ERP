const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Department name is required'], // ✅ অন করে দেওয়া হলো
      unique: true, 
      trim: true 
    },
    code: { 
      type: String, 
      required: [true, 'Department code is required'], // ✅ অন করে দেওয়া হলো
      unique: true, 
      uppercase: true, 
      trim: true // e.g., 'HR', 'IT', 'ACCOUNTS'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', departmentSchema);

