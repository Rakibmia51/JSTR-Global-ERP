const fs = require('fs'); // ফাইল ডিলিট করার জন্য কোর Node.js মডিউল
const bcrypt = require('bcryptjs'); // পাসওয়ার্ড হ্যাশ করার জন্য
const Dealer = require('../models/Dealer');

// 1st version of dealerController.js with improved error handling, file upload checks, and unique field validation.
// @desc    Register a new dealer with photos
// @route   POST /api/dealers/register
// @access  Public
// const registerDealer = async (req, res) => {
//     try {
//         // ১. রিকোয়েস্ট বডি থেকে ডাটা ডেসট্রাকচারিং করা (এখান থেকে dealerId বাদ দেওয়া হয়েছে)
//         const {
//             password, referenceIdNo, district, thana, status,
//             name, dateOfBirth, nationalIdNo, fathersName, mothersName,
//             mobilePhoneNo, email, address, photo, nidPhoto
//         } = req.body;

//         // ২. ফাইল চেকিং লজিক (ফাইল আপলোড হলে সেটির পাথ, নাহলে বডির টেক্সট/ডিফল্ট পাথ নেবে)
//         const uploadedPhoto = (req.files && req.files.photo) ? req.files.photo[0].path : photo;
//         const uploadedNidPhoto = (req.files && req.files.nidPhoto) ? req.files.nidPhoto[0].path : nidPhoto;

//         if (!uploadedPhoto || !uploadedNidPhoto) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: 'Both Photo and NID Photo are required.' 
//             });
//         }

//         // ৩. ইউনিক ফিল্ডগুলো ডাটাবেজে আগে থেকে আছে কিনা তা চেক করা 
//         // (এখানে $or কন্ডিশন থেকে dealerId চেকটি বাদ দেওয়া হয়েছে, কারণ আইডি ব্যাকএন্ডে তৈরি হবে)
//         const dealerExists = await Dealer.findOne({
//             $or: [{ nationalIdNo }, { mobilePhoneNo }, { email }]
//         });

//         if (dealerExists) {
//             // সুনির্দিষ্ট মেসেজ দেওয়ার জন্য কোন ফিল্ডটি মিলল তা চেক করা
//             let matchField = 'National ID, Mobile, or Email';
//             if (dealerExists.nationalIdNo === nationalIdNo) matchField = 'National ID';
//             else if (dealerExists.mobilePhoneNo === mobilePhoneNo) matchField = 'Mobile Number';
//             else if (dealerExists.email === email) matchField = 'Email Address';

//             return res.status(400).json({
//                 success: false,
//                 message: `A dealer with this ${matchField} already exists.`
//             });
//         }

//         // ৪. নতুন ডিলার অবজেক্ট তৈরি করা 
//         // 💡 লক্ষ্য করুন: এখানে dealerId পাস করা হয়নি, মঙ্গুজ pre-save মিডলওয়্যার এটি নিজে তৈরি করে নেবে
//         const newDealer = new Dealer({
//             password, referenceIdNo, district, thana, status,
//             name, dateOfBirth, nationalIdNo, fathersName, mothersName,
//             mobilePhoneNo, email, address,
//             photo: uploadedPhoto,       
//             nidPhoto: uploadedNidPhoto  
//         });

//         // ৫. ডাটাবেজে সেভ করা (এটি রান হওয়ার সাথে সাথে pre-save মিডলওয়্যারটি DLR-2026-0001 আইডি বানাবে)
//         await newDealer.save();

//         res.status(201).json({
//             success: true,
//             message: 'Dealer registered successfully.',
//             data: newDealer
//         });

//     } catch (error) {
//         console.error("Dealer Controller Error:", error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error encountered.',
//             error: error.message
//         });
//     }
// };

// 2nd version of dealerController.js with improved error handling, file upload checks, and unique field validation.
// @desc    Register a new dealer with photos
// @route   POST /api/dealers/register
// @access  Public
const registerDealer = async (req, res) => {
    // যেকোনো এরর বা ভ্যালিডেশন ফেইল হলে Multer-এর আপলোড হওয়া ফাইল ডিলিট করার ফাংশন
    const deleteUploadedFiles = () => {
        if (req.files) {
            if (req.files.photo && req.files.photo[0]) {
                fs.unlink(req.files.photo[0].path, (err) => err && console.error("Photo delete error:", err));
            }
            if (req.files.nidPhoto && req.files.nidPhoto[0]) {
                fs.unlink(req.files.nidPhoto[0].path, (err) => err && console.error("NID Photo delete error:", err));
            }
        }
    };

    try {
        // ১. রিকোয়েস্ট বডি থেকে ডাটা ডেসট্রাকচারিং করা (dealerId বাদ দিয়ে)
        const {
            password, referenceIdNo, district, thana, status,
            name, dateOfBirth, nationalIdNo, fathersName, mothersName,
            mobilePhoneNo, email, address, photo, nidPhoto
        } = req.body;

        // ২. ফাইল চেকিং লজিক (Multer এর Array/Fields অবজেক্ট অনুযায়ী ফিক্সড)
        const uploadedPhoto = (req.files && req.files.photo) ? req.files.photo[0].path : photo;
        const uploadedNidPhoto = (req.files && req.files.nidPhoto) ? req.files.nidPhoto[0].path : nidPhoto;

        if (!uploadedPhoto || !uploadedNidPhoto) {
            deleteUploadedFiles(); // ফাইল রিমুভ
            return res.status(400).json({ 
                success: false, 
                message: 'Both Photo and NID Photo are required.' 
            });
        }

        // ৩. ইউনিক ফিল্ডগুলো ডাটাবেজে আগে থেকে আছে কিনা তা চেক করা 
        const dealerExists = await Dealer.findOne({
            $or: [{ nationalIdNo }, { mobilePhoneNo }, { email }]
        });

        if (dealerExists) {
            deleteUploadedFiles(); // ডুপ্লিকেট ডাটা থাকলে আপলোড করা ফাইল সাথে সাথে সার্ভার থেকে মুছে দেওয়া হবে

            let matchField = 'National ID, Mobile, or Email';
            if (dealerExists.nationalIdNo === nationalIdNo) matchField = 'National ID';
            else if (dealerExists.mobilePhoneNo === mobilePhoneNo) matchField = 'Mobile Number';
            else if (dealerExists.email === email) matchField = 'Email Address';

            return res.status(400).json({
                success: false,
                message: `A dealer with this ${matchField} already exists.`
            });
        }

        // ৪. পাসওয়ার্ড সিকিউরিটি (Bcrypt Hashing)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ۵. নতুন ডিলার অবজেক্ট তৈরি করা 
        // 💡 মঙ্গুজ pre-save মিডলওয়্যারটি এই 'district' ফিল্ডের উপর ভিত্তি করে ডাইনামিক আইডি (যেমন: CHP-0001) তৈরি করবে
        const newDealer = new Dealer({
            password: hashedPassword, // হ্যাশ করা নিরাপদ পাসওয়ার্ড
            referenceIdNo, district, thana, status,
            name, dateOfBirth, nationalIdNo, fathersName, mothersName,
            mobilePhoneNo, email, address,
            photo: uploadedPhoto,       
            nidPhoto: uploadedNidPhoto  
        });

        // ৬. ডাটাবেজে সেভ করা 
        await newDealer.save();

        // রেসপন্স থেকে পাসওয়ার্ড ফিল্ডটি হাইড করা (সিকিউরিটির জন্য)
        const dealerResponse = newDealer.toObject();
        delete dealerResponse.password;

        res.status(201).json({
            success: true,
            message: 'Dealer registered successfully.',
            data: dealerResponse
        });

    } catch (error) {
        deleteUploadedFiles(); // যেকোনো সিস্টেম বা ডাটাবেজ এরর হলে ফাইল ডিলিট
        console.error("Dealer Controller Error:", error);
        res.status(500).json({
            success: false,
            message: 'Server error encountered.',
            error: error.message
        });
    }
};

// @desc    Get all dealers list
// @route   GET /api/dealers
// @access  Public

// 1st version of getDealers function (commented out for reference)
// const getDealers = async (req, res) => {
//     try {
//         // ডাটাবেজের সব ডিলারের ডাটা নিয়ে আসবে (নতুনগুলো সবার আগে দেখানোর জন্য sort করা হয়েছে)
//         const dealers = await Dealer.find().sort({ createdAt: -1 });

//         res.status(200).json({
//             success: true,
//             count: dealers.length,
//             data: dealers
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Server error encountered while fetching dealers.',
//             error: error.message
//         });
//     }
// };




// 2nd version of getDealers function with pagination and search
const getDealers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20; 
        const skip = (page - 1) * limit;
        
        const { search, status } = req.query;

        // ডাইনামিক কুয়েরি অবজেক্ট তৈরি
        let query = {};

        // 🔍 ১. সার্চ ফিল্টার লজিক (ফ্রন্টএন্ডের ফিল্ড নেমগুলোর সাথে সিঙ্ক করা হয়েছে)
        if (search && search.trim() !== '' && search !== 'undefined') {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { dealerId: { $regex: search, $options: 'i' } }, 
                { district: { $regex: search, $options: 'i' } },
                { thana: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { mobilePhoneNo: { $regex: search, $options: 'i' } } // 👈 mobileNo পরিবর্তন করে mobilePhoneNo করা হয়েছে
            ];
            
            // যদি আপনার মডেলে shopName থাকে, তবে নিচের লাইনটি আনকমেন্ট করতে পারেন
            // query.$or.push({ shopName: { $regex: search, $options: 'i' } });
        }

        // 🟢 ২. স্ট্যাটাস ফিল্টার লজিক
        if (status && status.trim() !== '' && status !== 'undefined') {
            query.status = status; 
        }

        // ডাটাবেজ থেকে নির্দিষ্ট পেজের ডাটা তুলে আনা
        const dealers = await Dealer.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // ফিল্টার অনুযায়ী মোট ম্যাচিং ডিলারের সংখ্যা কাউন্ট করা
        const totalDealers = await Dealer.countDocuments(query);

        res.status(200).json({
            success: true,
            count: dealers.length,
            total: totalDealers,
            totalPages: Math.ceil(totalDealers / limit) || 1,
            currentPage: page,
            data: dealers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error encountered while fetching dealers.',
            error: error.message
        });
    }
};



// ১. View Dealer Details (একটি নির্দিষ্ট ডিলারের সব তথ্য দেখা)
const viewDealer = async (req, res) => {
    try {
        const { id } = req.params; // রাউট থেকে আইডি নেওয়া হবে (যেমন: /api/dealers/:id)

        const dealer = await Dealer.findById(id);

        if (!dealer) {
            return res.status(404).json({
                success: false,
                message: 'Dealer not found.'
            });
        }

        res.status(200).json({
            success: true,
            data: dealer
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error encountered while fetching dealer.',
            error: error.message
        });
    }
};

// ২. Update Dealer Details (তথ্য ও নতুন ফাইল আপডেট করা)
const updateDealer = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body }; // বডির সব ডেটা কপি করে নেওয়া হলো

        // --- ফাইল চেকিং লজিক (নতুন ফাইল আপলোড হলে পাথ পরিবর্তন হবে, না হলে আগেরটিই থাকবে) ---
        if (req.files && req.files.photo) {
            updateData.photo = req.files.photo[0].path;
        }
        if (req.files && req.files.nidPhoto) {
            updateData.nidPhoto = req.files.nidPhoto[0].path;
        }

        // ইউনিক ফিল্ড চেকিং (যাতে অন্য ডিলারের ইমেইল/মোবাইল নম্বরের সাথে মিলে না যায়)
        // যে ডিলার আপডেট হচ্ছে তাকে বাদ দিয়ে ($ne: id) বাকিদের চেক করা হচ্ছে
        const duplicateCheck = await Dealer.findOne({
            _id: { $ne: id },
            $or: [
                { dealerId: updateData.dealerId },
                { nationalIdNo: updateData.nationalIdNo },
                { mobilePhoneNo: updateData.mobilePhoneNo },
                { email: updateData.email }
            ].filter(condition => Object.values(condition)[0] !== undefined) // শুধু পাঠানো ফিল্ডগুলো চেক করবে
        });

        if (duplicateCheck) {
            return res.status(400).json({
                success: false,
                message: 'Another dealer already exists with this Dealer ID, National ID, Mobile, or Email.'
            });
        }

        // ডেটাবেজে আপডেট করা এবং আপডেটেড ডেটা রিটার্ন করা { new: true }
        const updatedDealer = await Dealer.findByIdAndUpdate(id, updateData, { 
            new: true, 
            runValidators: true 
        });

        if (!updatedDealer) {
            return res.status(404).json({
                success: false,
                message: 'Dealer not found for update.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Dealer updated successfully.',
            data: updatedDealer
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error encountered while updating dealer.',
            error: error.message
        });
    }
};

// ৩. Delete Dealer (ডিলার রিমুভ করা)
const deleteDealer = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedDealer = await Dealer.findByIdAndDelete(id);

        if (!deletedDealer) {
            return res.status(404).json({
                success: false,
                message: 'Dealer not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Dealer deleted successfully.'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error encountered while deleting dealer.',
            error: error.message
        });
    }
};

// ৪. Get Dealer by Code (ডিলারের কোড দিয়ে ডিলারের নাম ও আইডি রিটার্ন করা)
const getDealerByCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    // Clean spaces and transform to uppercase (e.g., 'dlr-0001' becomes 'DLR-0001')
    const formattedCode = code.trim().toUpperCase();

    // Direct string match lookup for better performance and accuracy
    const dealer = await Dealer.findOne(
      { dealerId: formattedCode }, 
      { name: 1, _id: 1 }
    );

    if (!dealer) {
      return res.status(404).json({ success: false, message: 'Dealer not found in database' });
    }

    res.status(200).json({ success: true, data: dealer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
    registerDealer, getDealers, viewDealer, updateDealer, deleteDealer, getDealerByCode
};
