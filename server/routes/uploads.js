
import { Router } from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

import {
    requireAuth,
    requireAdmin
} from '../middleware/auth.js';

export const uploadRouter = Router();

// ========================================
// Multer Configuration
// ========================================

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, callback) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return callback(
                new Error('Only JPG, PNG and WEBP images are allowed.')
            );
        }

        callback(null, true);
    }
});

// ========================================
// Reusable Cloudinary Upload Function
// ========================================

function uploadToCloudinary(buffer, options) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                ...options,
                resource_type: 'image'
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        stream.end(buffer);
    });
}

// ========================================
// Upload Product Image
// POST /api/uploads/image
// ========================================

uploadRouter.post(
    '/image',
    requireAuth,
    requireAdmin,
    upload.single('image'),
    async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    error: 'Please select an image.'
                });
            }

            const result = await uploadToCloudinary(
                req.file.buffer,
                {
                    folder: 'mochimart/products'
                }
            );

            res.status(201).json({
                message: 'Product image uploaded successfully.',
                image: {
                    url: result.secure_url,
                    publicId: result.public_id
                }
            });

        } catch (error) {
            next(error);
        }
    }
);

// ========================================
// Upload Admin Profile Image
// POST /api/uploads/profile
// ========================================

uploadRouter.post(
    '/profile',
    requireAuth,
    requireAdmin,
    upload.single('image'),
    async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    error: 'Please select a profile image.'
                });
            }

            const result = await uploadToCloudinary(
                req.file.buffer,
                {
                    folder: 'mochimart/profiles',
                    public_id: req.user.uid,
                    overwrite: true,
                    invalidate: true
                }
            );

            res.status(201).json({
                message: 'Profile image uploaded successfully.',
                image: {
                    url: result.secure_url,
                    publicId: result.public_id
                }
            });

        } catch (error) {
            next(error);
        }
    }
);



// ========================================
// Upload Customer Profile Image
// POST /api/uploads/customer-profile
// ========================================

uploadRouter.post(
    '/customer-profile',
    requireAuth,
    upload.single('image'),
    async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    error: 'Please select a profile image.'
                });
            }

            const result = await uploadToCloudinary(
                req.file.buffer,
                {
                    folder: 'mochimart/customer-profiles',
                    public_id: req.user.uid,
                    overwrite: true,
                    invalidate: true
                }
            );

            res.status(201).json({
                message: 'Customer profile image uploaded successfully.',
                image: {
                    url: result.secure_url,
                    publicId: result.public_id
                }
            });
        } catch (error) {
            next(error);
        }
    }
);
