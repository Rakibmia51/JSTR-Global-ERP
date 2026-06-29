const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // --- মেইন অ্যাকাউন্ট ইনফো / Main Account Info ---
    idNo: { type: String, unique: true, trim: true },
    refIdNo: { type: String, trim: true, default: '' },
    name: { type: String, required: [true, 'Name of staff is required'] },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters long'] },
    role: { type: String, enum: ['admin', 'boardMember', 'manager', 'employee', 'dealer'], default: 'employee' },
    
    // --- ডিপার্টমেন্ট কানেকশন / Department Connection ---
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: [true, 'Department is required'] },
    
    isActive: { type: Boolean, default: true },

    // --- পার্সোনাল ইনফো / Personal Info ---
    dateOfBirth: { type: Date, required: [true, 'Date of Birth is required'] },
    gender: { type: String, required: [true, 'Gender is required'], enum: ['Male', 'Female', 'Other'] },
    nidNo: { type: String, required: [true, 'NID No is required'], unique: true, trim: true },
    fatherName: { type: String, required: [true, "Father's Name is required"] },
    motherName: { type: String, required: [true, "Mother's Name is required"] },
    spouseName: { type: String, default: '' },
    mobileNo: { type: String, required: [true, 'Mobile no is required'], trim: true },
    photo: { type: String, default: 'default-profile.png' },

    // --- ঠিকানা / Address Info ---
    address: { type: String, required: [true, 'Address is required'] },
    district: { type: String, required: [true, 'District is required'] },
    thana: { type: String, required: [true, 'Thana is required'] },

    // --- নমিনি ইনফো / Nominee Info ---
    nominee: {
      name: { type: String, required: [true, 'Nominee Name is required'] },
      fatherName: { type: String, required: [true, "Nominee Father's Name is required"] },
      motherName: { type: String, required: [true, "Nominee Mother's Name is required"] },
      dateOfBirth: { type: Date, required: [true, 'Nominee Date of Birth is required'] },
      nidNo: { type: String, required: [true, 'Nominee NID No is required'], trim: true },
      relation: { type: String, required: [true, 'Relation with nominee is required'] },
      mobileNo: { type: String, required: [true, 'Nominee Mobile no is required'], trim: true },
      photo: { type: String, default: 'default-nominee.png' }
    }
  },
  { timestamps: true }
);

// অটোমেটিক ডিপার্টমেন্ট ওয়াইজ আইডি জেনারেট করার মিডলওয়্যার
// অটোমেটিক ডিপার্টমেন্ট ওয়াইজ আইডি জেনারেট করার মিডলওয়্যার (Mongoose v6/v7/v8 Safe)
userSchema.pre('save', async function () {
  // 💡 লক্ষ্য করুন: এখানে কোনো 'next' প্যারামিটার নেই

  // যদি idNo আগে থেকেই থাকে (যেমন আপডেট করার সময়), তবে কোড এখানেই স্টপ হবে
  if (!this.isNew || this.idNo) {
    return;
  }

  try {
    const Department = mongoose.models.Department || mongoose.model('Department');
    
    if (!this.department) {
      throw new Error('Department ID is missing in user data'); // next(error) এর বদলে সরাসরি throw করুন
    }

    const dept = await Department.findById(this.department);
    
    if (!dept) {
      throw new Error(`Department not found with ID: ${this.department}`);
    }

    // ডিপার্টমেন্ট কোড তৈরি
    const deptCode = dept.code || (dept.name ? dept.name.substring(0, 3).toUpperCase().replace(/\s/g, '') : 'EMP');
    const currentYear = new Date().getFullYear();

    const idPattern = new RegExp(`^${deptCode}-`);
    const lastUser = await mongoose.model('User').findOne(
      { idNo: idPattern },
      { idNo: 1 },
      { sort: { idNo: -1 } }
    );

    let nextSerialNumber = 1;

    if (lastUser && lastUser.idNo) {
      const parts = lastUser.idNo.split('-');
      const lastSerial = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSerial)) {
        nextSerialNumber = lastSerial + 1;
      }
    }

    const formattedSerial = String(nextSerialNumber).padStart(4, '0');
    
    // ৫. ফাইনাল আইডি সেট করা (Format: DEPT-SERIAL)
    this.idNo = `${deptCode}-${formattedSerial}`;

  } catch (error) {
    console.error("Error in User pre-save middleware:", error);
    throw error; // সরাসরি এরর থ্রো করলে মঙ্গুজ নিজে থেকেই সেভ প্রসেস আটকে দেবে
  }
});


// পাসওয়ার্ড এনক্রিপ্ট করার মিডলওয়্যার
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// লগইন এর সময় পাসওয়ার্ড ম্যাচ করার মেথড
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
