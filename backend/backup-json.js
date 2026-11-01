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



// Manualiy Backup of Database and Uploads Folder to Google Drive via OAuth2
// const mongoose = require('mongoose');
// const fs = require('fs');
// const path = require('path');
// const { google } = require('googleapis');
// const AdmZip = require('adm-zip');

// require('dotenv').config();
// const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/erp_jstr_global";

// // গুগল ড্রাইভ ফোল্ডার আইডি
// const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1GqfB8STrl7odqrNCj7lnZSBXZJRlJRNr';

// // OAuth2 ক্রেন্ডেন্সিয়াল (আপনার .env ফাইলে এগুলো থাকতে হবে)
// const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
// const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

// const uploadToGoogleDrive = async (filePath, fileName) => {
//     try {
//         const oAuth2Client = new google.auth.OAuth2(
//             CLIENT_ID,
//             CLIENT_SECRET,
//             REDIRECT_URI
//         );

//         oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

//         const drive = google.drive({ version: 'v3', auth: oAuth2Client });

//         const fileMetadata = {
//             name: fileName,
//             parents: [FOLDER_ID],
//         };

//         const media = {
//             mimeType: 'application/zip',
//             body: fs.createReadStream(filePath),
//         };

//         const response = await drive.files.create({
//             requestBody: fileMetadata,
//             media: media,
//             fields: 'id, name, webViewLink',
//         });

//         console.log(`🚀 Backup successfully uploaded to Google Drive! File ID: ${response.data.id}`);
//         console.log(`🔗 File Link: ${response.data.webViewLink}`);
//     } catch (err) {
//         console.error('❌ Google Drive upload failed:', err.message);
//     }
// };

// const runBackupAndDriveUpload = async () => {
//     try {
//         await mongoose.connect(MONGO_URI);
//         console.log('📦 Connected to MongoDB...');

//         const backupDir = path.join(__dirname, 'my_backup');
//         if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

//         // ১. ডাটাবেজ কালেকশন ব্যাকআপ
//         const collections = await mongoose.connection.db.listCollections().toArray();
//         for (let col of collections) {
//             const data = await mongoose.connection.db.collection(col.name).find({}).toArray();
//             fs.writeFileSync(path.join(backupDir, `${col.name}.json`), JSON.stringify(data, null, 2));
//         }

//         // ২. uploads ফোল্ডার ব্যাকআপ
//         const uploadsDir = path.join(__dirname, 'uploads');
//         if (fs.existsSync(uploadsDir)) {
//             fs.cpSync(uploadsDir, path.join(backupDir, 'uploads'), { recursive: true });
//         }

//         // ৩. Node.js দিয়ে জিপ ফাইল তৈরি করা (adm-zip ব্যবহার করে)
//         const zipFileName = `backup-${Date.now()}.zip`;
//         const zipFilePath = path.join(__dirname, zipFileName);
//         console.log('🗜️ Compressing backup using Node.js...');
        
//         const zip = new AdmZip();
//         zip.addLocalFolder(backupDir, 'my_backup');
//         zip.writeZip(zipFilePath);
//         console.log('✅ Zip file created successfully.');

//         // ৪. গুগল ড্রাইভে আপলোড করা
//         console.log('☁️ Uploading to Google Drive...');
//         await uploadToGoogleDrive(zipFilePath, zipFileName);

//         // ৫. অটো-ক্লিন: লোকাল টেম্পোরারি ফাইল ও ফোল্ডার মুছে ফেলা
//         fs.rmSync(backupDir, { recursive: true, force: true });
//         fs.unlinkSync(zipFilePath);
//         console.log('🧹 Local temporary backup files cleaned up successfully.');

//         process.exit(0);
//     } catch (err) {
//         console.error('❌ Process failed:', err);
//         process.exit(1);
//     }
// };

// runBackupAndDriveUpload();





// auto backup and upload to Google Drive every month on the last day at 23:59
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const AdmZip = require('adm-zip');
const cron = require('node-cron');

require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/erp_jstr_global";

// গুগল ড্রাইভ ফোল্ডার আইডি
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1GqfB8STrl7odqrNCj7lnZSBXZJRlJRNr';

// OAuth2 ক্রেনডেন্সিয়াল
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

const uploadToGoogleDrive = async (filePath, fileName) => {
    try {
        const oAuth2Client = new google.auth.OAuth2(
            CLIENT_ID,
            CLIENT_SECRET,
            REDIRECT_URI
        );

        oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

        const drive = google.drive({ version: 'v3', auth: oAuth2Client });

        const fileMetadata = {
            name: fileName,
            parents: [FOLDER_ID],
        };

        const media = {
            mimeType: 'application/zip',
            body: fs.createReadStream(filePath),
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink',
        });

        console.log(`🚀 Backup successfully uploaded to Google Drive! File ID: ${response.data.id}`);
        console.log(`🔗 File Link: ${response.data.webViewLink}`);
    } catch (err) {
        console.error('❌ Google Drive upload failed:', err.message);
    }
};

const runBackupAndDriveUpload = async () => {
    try {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(MONGO_URI);
            console.log('📦 Connected to MongoDB...');
        }

        const backupDir = path.join(__dirname, 'my_backup');
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

        // ১. ডাটাবেজ কালেকশন ব্যাকআপ
        const collections = await mongoose.connection.db.listCollections().toArray();
        for (let col of collections) {
            const data = await mongoose.connection.db.collection(col.name).find({}).toArray();
            fs.writeFileSync(path.join(backupDir, `${col.name}.json`), JSON.stringify(data, null, 2));
        }

        // ২. uploads ফোল্ডার ব্যাকআপ
        const uploadsDir = path.join(__dirname, 'uploads');
        if (fs.existsSync(uploadsDir)) {
            fs.cpSync(uploadsDir, path.join(backupDir, 'uploads'), { recursive: true });
        }

        // ৩. Node.js দিয়ে জিপ ফাইল তৈরি করা (adm-zip ব্যবহার করে)
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

    } catch (err) {
        console.error('❌ Backup Process failed:', err);
    }
};

// ==========================================
// অটোমেটিক ও ম্যানুয়াল দুইভাবেই রান করার লজিক
// ==========================================

const isManualRun = process.argv.includes('--now');

if (isManualRun) {
    // ১. ম্যানুয়াল মোড: টার্মিনালে 'node backup-json.js --now' দিলে সাথে সাথে ১ বার রান করে বন্ধ হয়ে যাবে
    console.log('⚡ Manual backup initiated...');
    runBackupAndDriveUpload().then(() => {
        console.log('🎉 Manual backup complete.');
        process.exit(0);
    });
} else {
    // ২. অটোমেটিক মোড: প্রতিদিন রাত ৩:০০ টায় অটো-রান হবে ('0 3 * * *')
    console.log('⏳ Scheduled backup service started.');
    console.log('⏰ Next automatic backup will run every day at 03:00 AM.');

    cron.schedule('23 3 * * *', async () => {
        console.log('⏰ Starting daily automated backup execution...');
        await runBackupAndDriveUpload();
    });
}