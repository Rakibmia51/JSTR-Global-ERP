const mongoose = require('mongoose');

// 1st version of the Dealer schema with auto-generated dealerId
// const dealerSchema = new mongoose.Schema({
//     // --- Core Info ---
//     dealerId: {
//         type: String,
//         unique: true,
//         trim: true
//     },
//     password: { 
//         type: String, 
//         required: [true, 'Password is required'], 
//         minlength: [6, 'Password must be at least 6 characters long']
//      },
//     referenceIdNo: {
//         type: String,
//         trim: true
//     },
//     district: {
//         type: String,
//         required: [true, 'District is required'],
//         trim: true
//     },
//     thana: {
//         type: String,
//         required: [true, 'Thana is required'],
//         trim: true
//     },
//     status: {
//         type: String,
//         enum: ['Active', 'Inactive'],
//         default: 'Active'
//     },

//     // --- Personal Information ---
//     name: {
//         type: String,
//         required: [true, 'Name is required'],
//         trim: true
//     },
//     dateOfBirth: {
//         type: Date,
//         required: [true, 'Date of Birth is required']
//     },
//     nationalIdNo: {
//         type: String,
//         required: [true, 'National ID No is required'],
//         unique: true,
//         trim: true
//     },
//     fathersName: {
//         type: String,
//         required: [true, "Father's Name is required"],
//         trim: true
//     },
//     mothersName: {
//         type: String,
//         required: [true, "Mother's Name is required"],
//         trim: true
//     },
//     mobilePhoneNo: {
//         type: String,
//         required: [true, 'Mobile Phone No is required'],
//         unique: true,
//         trim: true
//     },
//     email: {
//         type: String,
//         required: [true, 'Email is required'],
//         unique: true,
//         lowercase: true,
//         trim: true
//     },
//     address: {
//         type: String,
//         required: [true, 'Address is required']
//     },
    
//     // --- Uploaded Files ---
//     photo: {
//         type: String, 
//         required: [true, 'Dealer photo is required']
//     },
//     nidPhoto: {
//         type: String, 
//         required: [true, 'NID photo is required']
//     }
// }, {
//     timestamps: true
// });

// // অটোমেটিক ডিলার আইডি জেনারেট করার মিডলওয়্যার (Mongoose v6/v7/v8 Safe)
// dealerSchema.pre('save', async function () {
//     // যদি dealerId আগে থেকেই থাকে (যেমন আপডেট করার সময়), তবে কোড এখানেই স্টপ হবে
//     if (!this.isNew || this.dealerId) {
//         return;
//     }

//     try {
//         const currentYear = new Date().getFullYear(); // বর্তমান বছর (যেমন: 2026)
//         const prefix = 'DLR'; // ডিলারের জন্য ফিক্সড কোড

//         // এই বছরের সর্বশেষ তৈরি হওয়া ডিলারের আইডি খোঁজা
//         const idPattern = new RegExp(`^${prefix}-`);
//         const lastDealer = await mongoose.model('Dealer').findOne(
//             { dealerId: idPattern },
//             { dealerId: 1 },
//             { sort: { dealerId: -1 } } // সবচেয়ে বড়/সর্বশেষ আইডিটি আগে আসবে
//         );

//         let nextSerialNumber = 1;

//         if (lastDealer && lastDealer.dealerId) {
//             // সর্বশেষ আইডির শেষের অংশ (যেমন: DLR-2026-0004 থেকে 0004) আলাদা করা
//             const parts = lastDealer.dealerId.split('-');
//             const lastSerial = parseInt(parts[parts.length - 1], 10);
//             if (!isNaN(lastSerial)) {
//                 nextSerialNumber = lastSerial + 1;
//             }
//         }

//         // সিরিয়াল নম্বরটিকে ৪ ডিজিটের প্যাডিং দেওয়া (যেমন: 1 হয়ে যাবে 0001)
//         const formattedSerial = String(nextSerialNumber).padStart(4, '0');

//         // ফাইনাল আইডি সেট করা (Format: DLR-YEAR-SERIAL -> e.g., DLR-2026-0001)
//         this.dealerId = `${prefix}-${formattedSerial}`;

//     } catch (error) {
//         console.error("Error in Dealer pre-save middleware:", error);
//         throw error;
//     }
// });

// 2nd version of the Dealer schema without auto-generated dealerId
// বাংলাদেশের ৬৪টি জেলার স্ট্যান্ডার্ড ৩-অক্ষরের শর্ট কোড ম্যাপিং
const districtPrefixes = {
    "Dhaka": "DHK", 
    "Chandpur": "CHP", 
    "Chittagong": "CTG", 
    "Sylhet": "SYL", 
    "Rajshahi": "RAJ", 
    "Khulna": "KHU", 
    "Barisal": "BSL", 
    "Rangpur": "RAN", 
    "Mymensingh": "MYM", 
    "Comilla": "COM", 
    "Gazipur": "GAZ", 
    "Narayanganj": "NRG", 
    "Brahmanbaria": "BBA", 
    "Noakhali": "NOA", 
    "Feni": "FEN", 
    "Lakshmipur": "LAK", 
    "Coxs Bazar": "COX", 
    "Bandarban": "BAN", 
    "Rangamati": "RGM", 
    "Khagrachhari": "KHA", 
    "Narsingdi": "NAR", 
    "Manikganj": "MAN", 
    "Munshiganj": "MUN", 
    "Faridpur": "FAR", 
    "Gopalganj": "GOP", 
    "Madaripur": "MDP",
    "Rajbari": "RJB", 
    "Shariatpur": "SHA", 
    "Tangail": "TAN", 
    "Kishoreganj": "KSG", 
    "Netrokona": "NET", 
    "Sherpur": "SRP", 
    "Jamalpur": "JAM", 
    "Bogura": "BOG", 
    "Joypurhat": "JOY", 
    "Naogaon": "NAO", 
    "Natore": "NAT", 
    "Nawabganj": "CNG", 
    "Pabna": "PAB", 
    "Sirajganj": "SIR", 
    "Bagerhat": "BAG", 
    "Jashore": "JES", 
    "Jhenaidah": "JHE", 
    "Kushtia": "KUS", 
    "Magura": "MAG", 
    "Meherpur": "MEH", 
    "Narail": "NAL", 
    "Satkhira": "SAT", 
    "Chuadanga": "CHU",
    "Bhola": "BHO", 
    "Jhalokathi": "JHA", 
    "Patuakhali": "PAT", 
    "Pirojpur": "PIR", 
    "Barguna": "BAR", 
    "Dinajpur": "DIN",
    "Gaibandha": "GBD", 
    "Kurigram": "KUR", 
    "Lalmonirhat": "LAL",
    "Nilphamari": "NIL", 
    "Panchagarh": "PAN", 
    "Thakurgaon": "THG", 
    "Habiganj": "HAB", 
    "Moulvibazar": "MOU", 
    "Sunamganj": "SUN"
};

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
        trim: true,
        // ইনপুট ফরম্যাটিং সেফটি: ইউজার lowercase বা UPPERCASE দিলেও ডাটাবেজে "Chandpur" ফরম্যাটে সেভ হবে
        set: v => v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : v
    },
    thana: {
        type: String,
        required: [true, 'Thana is required'],
        trim: true,
        set: v => v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : v
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

// অটোমেটিক জেলা ভিত্তিক ডিলার আইডি জেনারেট করার মিডলওয়্যার (Mongoose Async Style - No 'next')
dealerSchema.pre('save', async function () {
    // যদি dealerId আগে থেকেই থাকে (যেমন আপডেট করার সময়), তবে কোড এখানেই স্টপ হবে
    if (!this.isNew || this.dealerId) {
        return; // next() কল করার প্রয়োজন নেই, জাস্ট রিটার্ন করলেই হবে
    }

    try {
        // ১. ডিলারের দেওয়া district থেকে কোড (Prefix) খুঁজে বের করা
        let prefix = districtPrefixes[this.district];
        
        // সেফটি মেকানিজম: জেলা যদি লিস্টে না মিলে, তবে নামের প্রথম ৩ অক্ষর কোড হিসেবে নেবে
        if (!prefix) {
            prefix = this.district.substring(0, 3).toUpperCase();
        } else {
            prefix = prefix.toUpperCase();
        }

        // ২. ডাটাবেজ থেকে শুধুমাত্র এই জেলার (যেমন: ^CHP-) সর্বশেষ আইডিটি খোঁজা
        const idPattern = new RegExp(`^${prefix}-`);
        const lastDealer = await mongoose.model('Dealer').findOne(
            { dealerId: idPattern },
            { dealerId: 1 },
            { sort: { dealerId: -1 } } // সবচেয়ে বড়/সর্বশেষ আইডিটি আগে আসবে
        );

        let nextSerialNumber = 1;

        // ৩. যদি আগে ওই জেলার কোনো ডিলার থাকে, তবে তার সিরিয়ালের সাথে ১ যোগ হবে
        if (lastDealer && lastDealer.dealerId) {
            const parts = lastDealer.dealerId.split('-');
            const lastSerial = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(lastSerial)) {
                nextSerialNumber = lastSerial + 1;
            }
        }

        // ৪. সিরিয়াল নম্বরটিকে ৪ ডিজিটের প্যাডিং দেওয়া (যেমন: ১ হয়ে যাবে 0001)
        const formattedSerial = String(nextSerialNumber).padStart(4, '0');

        // ৫. ফাইনাল কোড সেট করা (Format: PREFIX-SERIAL -> e.g., CHP-0001)
        this.dealerId = `${prefix}-${formattedSerial}`;

    } catch (error) {
        console.error("Error generating district-wise dealerId:", error);
        throw error; // next(error) এর পরিবর্তে সরাসরি এরর throw করতে হবে
    }
});



module.exports = mongoose.model('Dealer', dealerSchema);
