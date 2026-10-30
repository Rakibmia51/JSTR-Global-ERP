const multer = require("multer");
const path = require("path");
const fs = require("fs");

// CommonJS-এ __dirname সরাসরি পাওয়া যায়, তাই fileURLToPath-এর প্রয়োজন নেই
const LOGO_DIR = path.join(__dirname, "..", "uploads", "logos");
fs.mkdirSync(LOGO_DIR, { recursive: true });

const ALLOWED = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, LOGO_DIR),
  filename: (req, file, cb) => {
    const userId = req.userId || "anonymous"; 
    cb(null, `${userId}-${Date.now()}${ALLOWED[file.mimetype]}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // ২ মেগাবাইট
  fileFilter: (_req, file, cb) => {
    if (ALLOWED[file.mimetype]) return cb(null, true);
    const err = new Error("Logo must be a PNG, JPG or WEBP image");
    err.status = 400;
    cb(err);
  },
}).single("logo");

// কাস্টম রেপার মিডলওয়্যার
const uploadLogo = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "ফাইল সাইজ ২ মেগাবাইটের বেশি হতে পারবে না" });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(err.status || 400).json({ success: false, message: err.message });
    }
    next();
  });
};

// CommonJS-এ এক্সপোর্ট করার নিয়ম
module.exports = {
  uploadLogo,
  LOGO_DIR
};
