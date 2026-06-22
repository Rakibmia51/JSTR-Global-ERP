const multer = require('multer');
const path = require('path');

// ছবি কোন ফোল্ডারে এবং কি নামে সেভ হবে তা নির্ধারণ
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // রুট ডিরেক্টরিতে 'uploads' নামে একটি ফোল্ডার থাকতে হবে
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// শুধু মাত্র ইমেজ ফাইল (.jpg, .jpeg, .png) অ্যালাউ করার ফিল্টার
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
};

// মাল্টার মেইন ফাংশন এবং ২ মেগাবাইট ফাইল সাইজ লিমিট
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB Max
  fileFilter: fileFilter
});

// স্টাফের ফটো এবং নমিনির ফটোর জন্য ফিল্ড ডিফাইন করা
const cpUpload = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'nomineePhoto', maxCount: 1 }
]);

module.exports = cpUpload;
