const mongoose = require('mongoose');

const dealerSchema = new mongoose.Schema({
    // --- Core Info ---
    dealerId: {
        type: String,
        required: [true, 'Dealer ID is required'],
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

module.exports = mongoose.model('Dealer', dealerSchema);
