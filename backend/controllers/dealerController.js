const Dealer = require('../models/Dealer');

// @desc    Register a new dealer with photos
// @route   POST /api/dealers/register
// @access  Public
const registerDealer = async (req, res) => {
    try {
        const {
            dealerId, referenceIdNo, district, thana, status,
            name, dateOfBirth, nationalIdNo, fathersName, mothersName,
            mobilePhoneNo, email, address, photo, nidPhoto
        } = req.body;

        // --- ⚠️ ফাইল চেকিং লজিক আপডেট (ফাইল অথবা JSON বডি যেকোনো একটি থাকলেই হবে) ---
        const uploadedPhoto = (req.files && req.files.photo) ? req.files.photo[0].path : photo;
        const uploadedNidPhoto = (req.files && req.files.nidPhoto) ? req.files.nidPhoto[0].path : nidPhoto;

        if (!uploadedPhoto || !uploadedNidPhoto) {
            return res.status(400).json({ 
                success: false, 
                message: 'Both Photo and NID Photo are required.' 
            });
        }

        // Check for existing unique fields
        const dealerExists = await Dealer.findOne({
            $or: [{ dealerId }, { nationalIdNo }, { mobilePhoneNo }, { email }]
        });

        if (dealerExists) {
            return res.status(400).json({
                success: false,
                message: 'A dealer with this Dealer ID, National ID, Mobile, or Email already exists.'
            });
        }

        // Create new dealer object
        const newDealer = new Dealer({
            dealerId, referenceIdNo, district, thana, status,
            name, dateOfBirth, nationalIdNo, fathersName, mothersName,
            mobilePhoneNo, email, address,
            photo: uploadedPhoto,       // ফাইল থাকলে ফাইলের পাথ, JSON থাকলে JSON এর টেক্সট সেভ হবে
            nidPhoto: uploadedNidPhoto  
        });

        await newDealer.save();

        res.status(201).json({
            success: true,
            message: 'Dealer registered successfully.',
            data: newDealer
        });

    } catch (error) {
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


module.exports = {
    registerDealer, getDealers
};
