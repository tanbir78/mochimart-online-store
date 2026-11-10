
import { Router } from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

export const uploadRouter = Router();

// Store uploaded file temporarily in memory
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
            return callback(new Error('Only image files are allowed.'));
        }

        callback(null, true);
    }
});

// Upload image to Cloudinary
uploadRouter.post('/image', upload.single('image'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'Please select an image.'
            });
        }

        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'mochimart/products',
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

            stream.end(req.file.buffer);
        });

        res.status(201).json({
            message: 'Image uploaded successfully.',
            image: {
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id
            }
        });
    } catch (error) {
        next(error);
    }
});
