const mongoose = require('mongoose');

const dealerSchema = new mongoose.Schema({
    // --- Core Info ---
    dealerId: {
        type: String,
        unique: true,
        trim: true
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'], 
        minlength: [6, 'Password must be at least 6 characters long']
     },
    referenceIdNo: {
        type: String,
        trim: true
    },
    district: {
        type: String,
        required: [true, 'District is required'],
        trim: true
    },
    thana: {
        type: String,
        required: [true, 'Thana is required'],
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },

    // --- Personal Information ---
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of Birth is required']
    },
    nationalIdNo: {
        type: String,
        required: [true, 'National ID No is required'],
        unique: true,
        trim: true
    },
    fathersName: {
        type: String,
        required: [true, "Father's Name is required"],
        trim: true
    },
    mothersName: {
        type: String,
        required: [true, "Mother's Name is required"],
        trim: true
    },
    mobilePhoneNo: {
        type: String,
        required: [true, 'Mobile Phone No is required'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    
    // --- Uploaded Files ---
    photo: {
        type: String, 
        required: [true, 'Dealer photo is required']
    },
    nidPhoto: {
        type: String, 
        required: [true, 'NID photo is required']
    }
}, {
    timestamps: true
});



// অটোমেটিক ডিলার আইডি জেনারেট করার মিডলওয়্যার (Mongoose v6/v7/v8 Safe)
dealerSchema.pre('save', async function () {
    // যদি dealerId আগে থেকেই থাকে (যেমন আপডেট করার সময়), তবে কোড এখানেই স্টপ হবে
    if (!this.isNew || this.dealerId) {
        return;
    }

    try {
        const currentYear = new Date().getFullYear(); // বর্তমান বছর (যেমন: 2026)
        const prefix = 'DLR'; // ডিলারের জন্য ফিক্সড কোড

        // এই বছরের সর্বশেষ তৈরি হওয়া ডিলারের আইডি খোঁজা
        const idPattern = new RegExp(`^${prefix}-`);
        const lastDealer = await mongoose.model('Dealer').findOne(
            { dealerId: idPattern },
            { dealerId: 1 },
            { sort: { dealerId: -1 } } // সবচেয়ে বড়/সর্বশেষ আইডিটি আগে আসবে
        );

        let nextSerialNumber = 1;

        if (lastDealer && lastDealer.dealerId) {
            // সর্বশেষ আইডির শেষের অংশ (যেমন: DLR-2026-0004 থেকে 0004) আলাদা করা
            const parts = lastDealer.dealerId.split('-');
            const lastSerial = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(lastSerial)) {
                nextSerialNumber = lastSerial + 1;
            }
        }

        // সিরিয়াল নম্বরটিকে ৪ ডিজিটের প্যাডিং দেওয়া (যেমন: 1 হয়ে যাবে 0001)
        const formattedSerial = String(nextSerialNumber).padStart(4, '0');

        // ফাইনাল আইডি সেট করা (Format: DLR-YEAR-SERIAL -> e.g., DLR-2026-0001)
        this.dealerId = `${prefix}-${formattedSerial}`;

    } catch (error) {
        console.error("Error in Dealer pre-save middleware:", error);
        throw error;
    }
});

module.exports = mongoose.model('Dealer', dealerSchema);
