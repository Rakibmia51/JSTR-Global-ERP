import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const LOGO_DIR = path.join(__dirname, "..", "uploads", "logos");
fs.mkdirSync(LOGO_DIR, { recursive: true });

const ALLOWED = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, LOGO_DIR),
  filename: (req, file, cb) =>
    cb(null, `${req.userId}-${Date.now()}${ALLOWED[file.mimetype]}`),
});

// SVG is intentionally excluded: it can carry scripts.
export const uploadLogo = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED[file.mimetype]) return cb(null, true);
    const err = new Error("Logo must be a PNG, JPG or WEBP image");
    err.status = 400;
    cb(err);
  },
}).single("logo");
