/**
 * =====================================================================
 * Contributor: ARNAV
 * Role: Product Backend & Storage Engineer
 * Syllabus Sessions: Session 33 (fs & path Modules) & Session 40 (Multer File Uploads)
 * Feature: Multer Disk Storage & Image Upload Validation
 * =====================================================================
 */
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * Multer File Upload Middleware
 * Demonstrates:
 * - Session 33: Modules (ES Modules), File System Module (fs), Path Module
 * - Session 40: Multer File Uploads
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Ensure upload directory exists using fs module (Session 33)
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure disk storage for uploaded files
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    // Generate unique filename: fieldname-timestamp.ext
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

// File filter to allow only image files
function fileFilter(req, file, cb) {
  const filetypes = /jpe?g|png|webp|gif|svg/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpg, jpeg, png, webp, gif, svg) are allowed!'));
}

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max limit
  fileFilter,
});