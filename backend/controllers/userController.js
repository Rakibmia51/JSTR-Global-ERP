const mongoose = require("mongoose");
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const Department = require('../models/Department');
const Invoice = require('../models/Invoice');
const Dealer = require('../models/Dealer');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const userData = { ...req.body };

     // ফ্রন্টএন্ড থেকে আইডি পাঠানো হলেও তা মুছে দেওয়া হচ্ছে যাতে সিস্টেমেটিক আইডি তৈরি হয়
    delete userData.idNo; 

    // 💡 সমাধান: ফ্রন্টএন্ড থেকে আসা নমিনি স্ট্রিংটিকে অবজেক্টে রূপান্তর করা হচ্ছে
    if (userData.nominee && typeof userData.nominee === 'string') {
      userData.nominee = JSON.parse(userData.nominee);
    } else if (!userData.nominee) {
      userData.nominee = {};
    }

    // ছবি আপলোড হয়ে থাকলে সেগুলোর পাথ স্কিমা অনুযায়ী বসানো হচ্ছে
    if (req.files) {
      if (req.files.photo && req.files.photo[0]) {
        userData.photo = req.files.photo[0].path;
      }
      if (req.files.nomineePhoto && req.files.nomineePhoto[0]) {
        userData.nominee.photo = req.files.nomineePhoto[0].path;
      }
    }

    // যদি কোনো ছবি আপলোড না করা হয়, তবে ডিফল্ট ছবির নাম সেট করা হচ্ছে
    if (!userData.photo) userData.photo = 'default-profile.png';
    if (!userData.nominee.photo) userData.nominee.photo = 'default-nominee.png';

    // ডেটাবেসে ইউজার তৈরি করা
    const newEmployee = new User(userData);

    await newEmployee.save(); 

    return res.status(201).json({
      success: true,
      message: 'Employee and Nominee registered successfully!',
      data: newEmployee
    });

  } catch (error) {
    console.error("Mongoose Nominee Validation Failure:", error);
    return res.status(400).json({
      success: false,
      message: error.message // মঙ্গুজ বলবে কোন ফিল্ডটি এখনো মিসিং আছে
    });
  }
};


// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { idNo, password } = req.body;

    // ১. ইমেইল ও পাসওয়ার্ড ইনপুট দেওয়া হয়েছে কিনা চেক করা
    if (!idNo || !password) {
      return res.status(400).json({ message: 'please enter ID number and password' });
    }

    // ২. ইমেইল অনুযায়ী ইউজার ডাটাবেজে আছে কিনা চেক করা
    const user = await User.findOne({ idNo })
      .populate('department', 'name code'); // ডিপার্টমেন্টের নাম ও কোডও নিয়ে আসা

    // ৩. ইউজার থাকলে পাসওয়ার্ড ম্যাচ করানো (User মডেলের matchPassword মেথড কল করা)
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        idNo: user.idNo,
        role: user.role,
        departmentName: user.department ? user.department.name : 'N/A',
        departmentCode: user.department ? user.department.code : 'N/A',
        token: generateToken(user._id), // লগইন সফল হলে টোকেন পাঠানো হচ্ছে
        message: 'Login successful!'
      });
    } else {
      res.status(401).json({ message: 'Invalid ID number or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private (টোকেন লাগবে)
const getUserProfile = async (req, res) => {
  try {
    // authMiddleware অলরেডি req.user এর মধ্যে ইউজারের ডাটা সেট করে দিয়েছে
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // পাসওয়ার্ড ছাড়া সব ইউজার নিয়ে আসবে
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @desc    Get all employees list
// @route   GET /api/users
// @access  Private/Public (আপনার প্রজেক্ট অনুযায়ী)
const getAllEmployees = async (req, res) => {
  try {
    // .populate('department', 'name') দিলে শুধু ডিপার্টমেন্টের আইডি না এসে নামও চলে আসবে
    const employees = await User.find({}).populate('department', 'name').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

//ViewEmployee কন্ট্রোলার কোড
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    // ১. আইডি দিয়ে ডাটাবেজ থেকে এমপ্লয়ি খোঁজা এবং ডিপার্টমেন্টের নাম নিয়ে আসা (populate)
    const employee = await User.findById(id).populate('department', 'name');

    // ২. যদি ওই আইডির কোনো এমপ্লয়ি/ইউজার না পাওয়া যায়
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // ৩. ডাটা পাওয়া গেলে ফ্রন্টএন্ডে পাঠানো
    res.status(200).json({
      success: true,
      data: employee
    });

  } catch (error) {
    // যদি আইডি ফরম্যাট ভুল হয় (যেমন CastError) অথবা অন্য কোনো সার্ভার এরর হয়
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Update user / employee
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // ১. নোমিনি ডাটা স্ট্রিং হিসেবে আসলে অবজেক্টে রূপান্তর করা
    if (updateData.nominee && typeof updateData.nominee === 'string') {
      updateData.nominee = JSON.parse(updateData.nominee);
    }

    // ২. নতুন কোনো ফাইল/ছবি আপলোড করা হলে তার পাথ সেট করা
    if (req.files) {
      if (req.files.photo && req.files.photo[0]) {
        updateData.photo = req.files.photo[0].path;
      }
      if (req.files.nomineePhoto && req.files.nomineePhoto[0]) {
        // যদি নোমিনি অবজেক্ট আগে থেকে না থাকে তবে ফাকা অবজেক্ট তৈরি করে নেওয়া
        if (!updateData.nominee) updateData.nominee = {};
        updateData.nominee.photo = req.files.nomineePhoto[0].path;
      }
    }

    // পাসওয়ার্ড আপডেট করার চেষ্টা করলে তা হ্যাশ করার জন্য আলাদা লজিক লাগবে, 
    // তাই সাধারণ আপডেটে পাসওয়ার্ড ফিল্ডটি বাদ দেওয়া ভালো
    if (updateData.password) {
      delete updateData.password; 
    }

    // ৩. ডেটাবেজে ডাটা আপডেট করা
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true } // নতুন ডাটা রিটার্ন করবে এবং স্কিমা ভ্যালিডেশন চেক করবে
      ).populate('department', 'name');

      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.status(200).json({
        success: true,
        message: 'User updated successfully!',
        data: updatedUser
      });

    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

// @desc    Delete user / employee
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // ডেটাবেজ থেকে ইউজার ডিলিট করা
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully!'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}






//--- 1st Version of Employee Tree Controller ---//
// Controller function
// const getEmployeeTree = async (req, res) => {
//   try {
//     // 💡 সমাধান ১: ডাটাবেজ থেকে শুধুমাত্র যাদের idNo-এর শুরুতে 'MKT' আছে তাদের তুলে আনা
//     // ^MKT মানে হলো লেখার শুরুতেই MKT থাকতে হবে (Case-insensitive করার জন্য 'i' ব্যবহার করা হয়েছে)
//     const employees = await User.find({
//       idNo: { $regex: /^MKT/i }
//     }).lean();

//     const employeeMap = {};
//     const tree = [];

//     // ১. প্রথমে ফিল্টার হওয়া প্রতিটি এমপ্লয়িকে ম্যাপে রাখুন এবং তাদের children অ্যারে খালি করুন
//     employees.forEach(emp => {
//       employeeMap[emp.idNo] = { ...emp, children: [] };
//     });

//     // ২. লুপ চালিয়ে ১ এর নিচে ২,৩,৪ এবং ২ এর নিচে ৫,৬,৭ চেইন তৈরি করা
//     employees.forEach(emp => {
//       const currentEmployee = employeeMap[emp.idNo];
//       const parentIdNo = emp.refIdNo; // বসের আইডি (যেমন: "0" বা "MKT-0001")

//       // 💡 সমাধান ২: যদি কোনো এমপ্লয়ির বস (refIdNo) ডাটাবেজে না থাকে (কারণ বসের আইডি হয়তো MKT নয় এবং সে বাদ পড়েছে), 
//       // অথবা refIdNo যদি "0" বা খালি হয়, তবে তাকেই মেইন রুট (Top level) হিসেবে ট্রিতে পুশ করা হবে।
//       if (parentIdNo === "0" || !parentIdNo || !employeeMap[parentIdNo]) {
//         tree.push(currentEmployee);
//       } else {
//         // বসের children অ্যারের ভেতর বর্তমান এমপ্লয়িকে পুশ করা
//         employeeMap[parentIdNo].children.push(currentEmployee);
//       }
//     });

//     // ফ্রন্টএন্ডে ফিল্টার করা নেস্টেড ট্রি পাঠানো
//     res.status(200).json(tree);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

//--- 2nd Version of Employee Tree Controller ---//


// // অটোমেটিক পজিশন ইঞ্জিন (Rule 1 to 7)
// const autoDeterminePosition = (totalSales, subNodesSummary = []) => {
//   const amQualifiedCount = subNodesSummary.filter(sub => sub.autoPosition === "AM").length;
//   const rsmQualifiedCount = subNodesSummary.filter(sub => sub.autoPosition === "RSM").length;
//   const dsmQualifiedCount = subNodesSummary.filter(sub => sub.autoPosition === "DSM").length;
//   const nsmQualifiedCount = subNodesSummary.filter(sub => sub.autoPosition === "NSM").length;

//   let assignedPosition = "Sales Representative";

//   if (nsmQualifiedCount >= 4 && totalSales >= 1600000) assignedPosition = "ED";
//   else if (dsmQualifiedCount >= 4 && totalSales >= 400000) assignedPosition = "NSM";
//   else if (dsmQualifiedCount >= 3 && totalSales >= 300000) assignedPosition = "SM";
//   else if (dsmQualifiedCount >= 2 && totalSales >= 200000) assignedPosition = "SDSM";
//   else if (rsmQualifiedCount >= 1 && amQualifiedCount >= 2 && totalSales >= 150000) assignedPosition = "DSM";
//   else if (amQualifiedCount >= 4 && totalSales >= 100000) assignedPosition = "RSM";
//   else if (totalSales >= 25000) assignedPosition = "AM";

//   return assignedPosition;
// };

// মেইন এক্সপোর্ট ফাংশন (ট্রি ভিউ এপিআই এর জন্য)
const getEmployeeTree = async (req, res) => {
try {
    const db = mongoose.connection.db;
    
   // ১. ডাটাবেজ থেকে সেলস/ইনভয়েস, ডিলার এবং MKT ইউজার তুলে আনা
    let allSales = await db.collection("invoices").find({}).toArray();
    if (!allSales || allSales.length === 0) {
      allSales = await db.collection("sales").find({}).toArray();
    }

    const dealers = await db.collection("dealers").find({}).toArray();
    const users = await db.collection("users").find({ idNo: { $regex: /^MKT/i } }).toArray();

    // চলতি মাসের ব্রেকপয়েন্ট নির্ধারণ (July 2026)
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); 
    const currentYear = currentDate.getFullYear(); 

    const userSalesMap = {};
    const tree = [];

    // ২. মেমোরি ম্যাপ তৈরি করা
    users.forEach(u => {
      userSalesMap[u.idNo] = { 
        ...u, 
        _id: u._id.toString(),
        directSalesTotal: 0,       
        directSalesThisMonth: 0,   
        totalSalesVolume: 0,       
        thisMonthSalesVolume: 0,   
        autoPosition: "Sales Representative",
        children: [] 
      };
    });

    // ৩. ডাইনামিক সেলস ক্যালকুলেশন (আর্কাইভড স্ন্যাপশট বনাম লাইভ রিলেশন)
    allSales.forEach(sale => {
      const saleAmount = sale.grandTotal || 0;
      const saleDate = new Date(sale.createdAt);
      const isCurrentMonth = saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
      
      let targetEmployeeIdNo = null;

      // ক) ইনভয়েসটি যদি ইতিমধ্যে আর্কাইভড হয়ে থাকে, তবে সরাসরি ভেতরের স্ন্যাপশট আইডি ব্যবহার করব (যা কখনো চেঞ্জ হবে না)
      if (sale.isMonthlyArchived && sale.archivedSalesData?.employeeSnapshot?.idNo) {
        targetEmployeeIdNo = sale.archivedSalesData.employeeSnapshot.idNo;
      } 
      // খ) যদি ইনভয়েসটি আর্কাইভড না হয় (রানিং মাস), তবে ডিলারের কারেন্ট referenceIdNo দিয়ে ট্র্যাক করব
      else if (sale.dealer) {
        const matchingDealer = dealers.find(d => d._id.toString() === sale.dealer.toString());
        if (matchingDealer && matchingDealer.referenceIdNo) {
          targetEmployeeIdNo = matchingDealer.referenceIdNo;
        }
      }

      // গ) প্রাপ্ত এমপ্লয়ি আইডিতে সেলস অ্যামাউন্ট যোগ করা
      if (targetEmployeeIdNo && userSalesMap[targetEmployeeIdNo]) {
        userSalesMap[targetEmployeeIdNo].directSalesTotal += saleAmount;
        userSalesMap[targetEmployeeIdNo].totalSalesVolume += saleAmount; // রিকিউরসিভ ভলিউমের বেস ভ্যালু

        if (isCurrentMonth) {
          userSalesMap[targetEmployeeIdNo].directSalesThisMonth += saleAmount;
          userSalesMap[targetEmployeeIdNo].thisMonthSalesVolume += saleAmount; // রিকিউরসিভ মান্থলি ভলিউমের বেস ভ্যালু
        }
      }
    });

   
    // পজিশন হায়ারার্কি র্যাংক (সিনিয়র মেম্বারদের কাউন্ট করার জন্য)
    const RANK_MAP = {
      "SALES REPRESENTATIVE": 0, "AM": 1, "RSM": 2, "DSM": 3, 
      "SDSM": 4, "SM": 5, "NSM": 6, "ED": 7, "BOM": 8
    };

  
    const autoDeterminePosition = (salesVolume, subNodesSummary = []) => {
      // ১. ওয়ান-পাস অপ্টিমাইজড কাউন্টিং (বারবার ফিল্টার লুপ এড়ানোর জন্য)
      const counts = { AM: 0, RSM: 0, DSM: 0, NSM: 0, ED: 0, BOM: 0 };
      
      subNodesSummary.forEach(sub => {
        const pos = (sub.autoPosition || "").toUpperCase().trim();
        if (counts[pos] !== undefined) counts[pos]++;
      });

      // ২. কিউমুলেটিভ হেল্পার (টার্গেট পজিশন বা তার চেয়ে বড় পজিশনের মেম্বারদেরও গুনবে)
      const countAtLeast = (targetPos) => {
        return Object.keys(counts).reduce((total, pos) => {
          return RANK_MAP[pos] >= RANK_MAP[targetPos] ? total + counts[pos] : total;
        }, 0);
      };

      // =======================================================================
      // ৩. সঠিক কন্ডিশনাল অর্ডার সিকোয়েন্স (Top to Bottom অনুসারে আপনার রিকোয়ারমেন্ট)
      // =======================================================================

      // ৮. BOM: ২ জন ED কোয়ালিফাই এবং ৬৪ লাখ (৬৪,০০,০০০) সেলস হতে হবে
      if (salesVolume >= 6400000 && countAtLeast("ED") >= 2) return "BOM";

      // ৭. ED: ৪ জন NSM কোয়ালিফাই এবং ৩২ লাখ (৩২,০০,০০০) সেলস হতে হবে
      if (salesVolume >= 3200000 && countAtLeast("NSM") >= 4) return "ED";
      
      // ৬. NSM: ৪ জন DSM কোয়ালিফাই এবং ৮ লাখ (৮,০০,০০০) সেলস হতে হবে
      if (salesVolume >= 800000 && countAtLeast("DSM") >= 4) return "NSM";
      
      // ৫. SM: ৩ জন DSM কোয়ালিফাই এবং ৬ লাখ (৬,০০,০০০) সেলস হতে হবে
      if (salesVolume >= 600000 && countAtLeast("DSM") >= 3) return "SM";
      
      // ৪. SDSM: ২ জন DSM কোয়ালিফাই এবং ৪ লাখ (৪,০০,০০০) সেলস হতে হবে
      if (salesVolume >= 400000 && countAtLeast("DSM") >= 2) return "SDSM";
      
      // ৩. DSM: (২ জন RSM এবং ২ জন AM) অথবা (৪ জন RSM) কোয়ালিফাই এবং ২ লাখ (২,০০,০০০) সেলস হতে হবে
      if (salesVolume >= 200000 && (
          (countAtLeast("RSM") >= 2 && countAtLeast("AM") >= 2) || 
          countAtLeast("RSM") >= 4
      )) {
        return "DSM";
      }
      
      // ২. RSM: ৩ জন AM কোয়ালিফাই এবং ৭৫ হাজার (৭৫,০০০) সেলস হতে হবে
      if (salesVolume >= 75000 && countAtLeast("AM") >= 3) return "RSM";
      
      // ১. AM: ২৫ হাজার (২৫,০০০) সেলস হতে হবে
      if (salesVolume >= 25000) return "AM";
      
      return "SALES REPRESENTATIVE";
    };


    // thisMonthSalesVolume এবং TotalSalesVolume সহ প্রতিটি এমপ্লয়ির জন্য পজিশন নির্ধারণ করা    

    // ১. ওয়ান-পাস চাইল্ড ম্যাপ তৈরি (বারবার users.filter লুপ এড়ানোর জন্য)
    const childMap = {};
    users.forEach(u => {
      const parentId = u.refIdNo;
      if (parentId && parentId !== "0") {
        if (!childMap[parentId]) childMap[parentId] = [];
        childMap[parentId].push(u.idNo);
      }
    });

    // ২. রিকার্সিভ ফাংশন: নিচ থেকে উপরে সেলস ও পজিশন পুশ করা
    const processHierarchySpecs = (currentIdNo) => {
      const currentEmployee = userSalesMap[currentIdNo];
      if (!currentEmployee) return;

      // সরাসরি ম্যাপ থেকে চাইল্ড আইডিগুলো নেওয়া (পারফরম্যান্স বুস্ট)
      const childrenIds = childMap[currentIdNo] || [];

      // পোস্ট-অর্ডার ট্রাভার্সাল: আগে ডাউনলাইনের শেষ প্রান্তের মেম্বারদের হিসাব শেষ হবে
      childrenIds.forEach(childId => processHierarchySpecs(childId));

      // চাইল্ডদের আপডেটেড পজিশন ও সেলস ভলিউম সংগ্রহ
      const subNodesSummary = [];
      let teamSalesSumTotal = 0;
      let teamSalesSumMonth = 0;

      childrenIds.forEach(childId => {
        const childData = userSalesMap[childId];
        if (childData) {
          subNodesSummary.push({
            idNo: childId,
            autoPosition: childData.autoPosition || "Sales Representative"
          });
          teamSalesSumTotal += childData.totalSalesVolume;
          teamSalesSumMonth += childData.thisMonthSalesVolume;
        }
      });

      // ডাউনলাইনের লাইফটাইম এবং চলতি মাসের সেলস আপলাইনের সাথে যোগ হবে
      currentEmployee.totalSalesVolume += teamSalesSumTotal;
      currentEmployee.thisMonthSalesVolume += teamSalesSumMonth;

      // 💥 পরিবর্তন ১: পজিশন নির্ধারণের জন্য 'totalSalesVolume' পাঠানো হলো
      currentEmployee.autoPosition = autoDeterminePosition(currentEmployee.totalSalesVolume, subNodesSummary);
    };

    // ৩. ট্রির রুট নোড (Top Parents) থেকে প্রসেসিং শুরু করা
    users.forEach(user => {
      if (user.refIdNo === "0" || !user.refIdNo || !userSalesMap[user.refIdNo]) {
        processHierarchySpecs(user.idNo);
      }
    });

    // ৪. ফাইনাল রেসপন্স ট্রি এবং ফরম্যাটিং তৈরি করা
    users.forEach(user => {
      const currentEmployee = userSalesMap[user.idNo];
      if (!currentEmployee) return;

      // ফ্রন্টএন্ড রিকোয়ারমেন্ট অনুযায়ী ফিল্ড অ্যাসাইন
      currentEmployee.position = currentEmployee.autoPosition;
      
      // 💥 পরিবর্তন ২: ফাইনাল অ্যাচিভড ভলিউম হিসেবে টোটাল সেলস অ্যাসাইন
      currentEmployee.totalSalesAchieved = currentEmployee.totalSalesVolume;
      currentEmployee.thisMonthSalesAchieved = currentEmployee.thisMonthSalesVolume;

      const parentIdNo = user.refIdNo;
      if (parentIdNo === "0" || !parentIdNo || !userSalesMap[parentIdNo]) {
        // যাদের প্যারেন্ট নেই তারা মেইন রুট ট্রিতে যাবে
        tree.push(currentEmployee);
      } else {
        // যাদের প্যারেন্ট আছে তারা প্যারেন্টের 'children' অ্যারেতে ঢুকবে
        userSalesMap[parentIdNo].children.push(currentEmployee);
      }
    });



    res.status(200).json(tree);
  } catch (error) {
    console.error("❌ BACKEND CRASH ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};



module.exports = {getEmployeeTree, registerUser, loginUser, getUserProfile, getAllUsers, getAllEmployees, updateUser, deleteUser, getEmployeeById};
