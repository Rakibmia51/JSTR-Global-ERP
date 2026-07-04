const Dealer = require('../models/Dealer');

// @desc    Register a new dealer with photos
// @route   POST /api/dealers/register
// @access  Public
const registerDealer = async (req, res) => {
    try {
        // ১. রিকোয়েস্ট বডি থেকে ডাটা ডেসট্রাকচারিং করা (এখান থেকে dealerId বাদ দেওয়া হয়েছে)
        const {
            password, referenceIdNo, district, thana, status,
            name, dateOfBirth, nationalIdNo, fathersName, mothersName,
            mobilePhoneNo, email, address, photo, nidPhoto
        } = req.body;

        // ২. ফাইল চেকিং লজিক (ফাইল আপলোড হলে সেটির পাথ, নাহলে বডির টেক্সট/ডিফল্ট পাথ নেবে)
        const uploadedPhoto = (req.files && req.files.photo) ? req.files.photo[0].path : photo;
        const uploadedNidPhoto = (req.files && req.files.nidPhoto) ? req.files.nidPhoto[0].path : nidPhoto;

        if (!uploadedPhoto || !uploadedNidPhoto) {
            return res.status(400).json({ 
                success: false, 
                message: 'Both Photo and NID Photo are required.' 
            });
        }

        // ৩. ইউনিক ফিল্ডগুলো ডাটাবেজে আগে থেকে আছে কিনা তা চেক করা 
        // (এখানে $or কন্ডিশন থেকে dealerId চেকটি বাদ দেওয়া হয়েছে, কারণ আইডি ব্যাকএন্ডে তৈরি হবে)
        const dealerExists = await Dealer.findOne({
            $or: [{ nationalIdNo }, { mobilePhoneNo }, { email }]
        });

        if (dealerExists) {
            // সুনির্দিষ্ট মেসেজ দেওয়ার জন্য কোন ফিল্ডটি মিলল তা চেক করা
            let matchField = 'National ID, Mobile, or Email';
            if (dealerExists.nationalIdNo === nationalIdNo) matchField = 'National ID';
            else if (dealerExists.mobilePhoneNo === mobilePhoneNo) matchField = 'Mobile Number';
            else if (dealerExists.email === email) matchField = 'Email Address';

            return res.status(400).json({
                success: false,
                message: `A dealer with this ${matchField} already exists.`
            });
        }

        // ৪. নতুন ডিলার অবজেক্ট তৈরি করা 
        // 💡 লক্ষ্য করুন: এখানে dealerId পাস করা হয়নি, মঙ্গুজ pre-save মিডলওয়্যার এটি নিজে তৈরি করে নেবে
        const newDealer = new Dealer({
            password, referenceIdNo, district, thana, status,
            name, dateOfBirth, nationalIdNo, fathersName, mothersName,
            mobilePhoneNo, email, address,
            photo: uploadedPhoto,       
            nidPhoto: uploadedNidPhoto  
        });

        // ৫. ডাটাবেজে সেভ করা (এটি রান হওয়ার সাথে সাথে pre-save মিডলওয়্যারটি DLR-2026-0001 আইডি বানাবে)
        await newDealer.save();

        res.status(201).json({
            success: true,
            message: 'Dealer registered successfully.',
            data: newDealer
        });

    } catch (error) {
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
const getDealers = async (req, res) => {
    try {
        // ডাটাবেজের সব ডিলারের ডাটা নিয়ে আসবে (নতুনগুলো সবার আগে দেখানোর জন্য sort করা হয়েছে)
        const dealers = await Dealer.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: dealers.length,
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
