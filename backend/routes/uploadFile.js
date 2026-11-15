import express from "express";
import multer from "multer";
import { storage } from "../config/cloudinary.js";
import { protect } from "../middleware/authMiddleware.js";

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf'
];

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (!file || !ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
            const err = new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file');
            err.message = 'Unsupported file type. Only JPEG, PNG, WEBP, GIF images and PDFs are allowed.';
            return cb(err, false);
        }
        cb(null, true);
    }
});

const router = express.Router();

const handleUploadMiddleware = (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
            return res.status(status).json({
                message: err.message || 'File upload failed.'
            });
        }
        next();
    });
};

router.post('/', protect, handleUploadMiddleware, (req, res) => {
    try {
        if (!req.file || !req.file.path) {
            return res.status(400).json({ message: 'No file uploaded or file rejected.' });
        }

        res.status(200).json({
            message: 'Upload successful',
            url: req.file.path,
            type: req.file.mimetype
        });
    } catch (error) {
        console.error('Upload Error Details:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;