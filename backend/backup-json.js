// Manualy Backup of Database and Uploads Folder in JSON Format

// const mongoose = require('mongoose');
// const fs = require('fs');
// const path = require('path');

// // backend-এর .env ফাইল লোড করা
// require('dotenv').config();

// // .env থেকে বা সরাসরি আপনার MongoDB URI দিন
// const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/erp_jstr_global";

// const backupAll = async () => {
//     try {
//         // ১. ডাটাবেজ কানেক্ট করা
//         await mongoose.connect(MONGO_URI);
//         console.log('📦 Connected to MongoDB for backup...');

//         const backupDir = path.join(__dirname, 'my_backup');
//         if (!fs.existsSync(backupDir)) {
//             fs.mkdirSync(backupDir, { recursive: true });
//         }

//         // ২. ডাটাবেজের সমস্ত কালেকশন JSON ফাইলে ব্যাকআপ নেওয়া
//         const collections = await mongoose.connection.db.listCollections().toArray();
//         for (let col of collections) {
//             const colName = col.name;
//             const data = await mongoose.connection.db.collection(colName).find({}).toArray();
            
//             fs.writeFileSync(
//                 path.join(backupDir, `${colName}.json`), 
//                 JSON.stringify(data, null, 2)
//             );
//             console.log(`✅ Collection backed up: ${colName}`);
//         }

//         // ৩. uploads ফোল্ডার ব্যাকআপ নেওয়া
//         const uploadsDir = path.join(__dirname, 'uploads');
//         const backupUploadsDir = path.join(backupDir, 'uploads');

//         if (fs.existsSync(uploadsDir)) {
//             if (!fs.existsSync(backupUploadsDir)) {
//                 fs.mkdirSync(backupUploadsDir, { recursive: true });
//             }
//             fs.cpSync(uploadsDir, backupUploadsDir, { recursive: true });
//             console.log('✅ Uploads folder backed up successfully!');
//         } else {
//             console.log('⚠️ No "uploads" folder found to backup.');
//         }

//         console.log('🚀 Complete backup (Database JSON + Uploads) finished successfully inside backend/my_backup!');
//         process.exit(0);
//     } catch (err) {
//         console.error('❌ Backup failed:', err);
//         process.exit(1);
//     }
// };

// backupAll();


// Automated Backup of Database and Uploads Folder in JSON Format to Google Drive
const { JWT } = require('google-auth-library');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const AdmZip = require('adm-zip'); // adm-zip প্যাকেজ রিকোয়ার করা

require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/erp_jstr_global";

// গুগল ড্রাইভ কনফিগারেশন
const KEY_FILE_PATH = path.join(__dirname, 'google-key.json');
const FOLDER_ID = 'SUCCESS_GLOBAL_BD_BACKUP'; // ড্রাইভে শেয়ার করা ফোল্ডারের আইডি এখানে দিন

const uploadToGoogleDrive = async (filePath, fileName) => {
    try {
        const keyFileContent = JSON.parse(fs.readFileSync(KEY_FILE_PATH, 'utf8'));

        const auth = new JWT({
            email: keyFileContent.client_email,
            key: keyFileContent.private_key,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });

        const drive = google.drive({ version: 'v3', auth });

        const fileMetadata = {
            name: fileName,
            parents: [FOLDER_ID],
        };

        const media = {
            mimeType: 'application/zip',
            body: fs.createReadStream(filePath),
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });

        console.log(`🚀 Backup successfully uploaded to Google Drive! File ID: ${response.data.id}`);
    } catch (err) {
        console.error('❌ Google Drive upload failed:', err.message);
    }
};

const runBackupAndDriveUpload = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('📦 Connected to MongoDB...');

        const backupDir = path.join(__dirname, 'my_backup');
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

        // ১. ডাটাবেজ কালেকশন ব্যাকআপ
        const collections = await mongoose.connection.db.listCollections().toArray();
        for (let col of collections) {
            const data = await mongoose.connection.db.collection(col.name).find({}.toArray ? {} : {}).toArray();
            fs.writeFileSync(path.join(backupDir, `${col.name}.json`), JSON.stringify(data, null, 2));
        }

        // ২. uploads ফোল্ডার ব্যাকআপ
        const uploadsDir = path.join(__dirname, 'uploads');
        if (fs.existsSync(uploadsDir)) {
            fs.cpSync(uploadsDir, path.join(backupDir, 'uploads'), { recursive: true });
        }

        // ৩. Node.js দিয়ে জিপ ফাইল তৈরি করা (adm-zip ব্যবহার করে)
        const zipFileName = `backup-${Date.now()}.zip`;
        const zipFilePath = path.join(__dirname, zipFileName);
        console.log('🗜️ Compressing backup using Node.js...');
        
        const zip = new AdmZip();
        zip.addLocalFolder(backupDir, 'my_backup');
        zip.writeZip(zipFilePath);
        console.log('✅ Zip file created successfully.');

        // ৪. গুগল ড্রাইভে আপলোড করা
        console.log('☁️ Uploading to Google Drive...');
        await uploadToGoogleDrive(zipFilePath, zipFileName);

        // ৫. অটো-ক্লিন: লোকাল টেম্পোরারি ফাইল ও ফোল্ডার মুছে ফেলা
        fs.rmSync(backupDir, { recursive: true, force: true });
        fs.unlinkSync(zipFilePath);
        console.log('🧹 Local temporary backup files cleaned up successfully.');

        process.exit(0);
    } catch (err) {
        console.error('❌ Process failed:', err);
        process.exit(1);
    }
};

runBackupAndDriveUpload();