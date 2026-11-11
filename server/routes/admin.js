
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { getDb } from '../config/database.js';

export const adminRouter = Router();

// Dashboard Statistics
async function getDashboard(req, res, next) {
    try {
        const db = getDb();

        const [
            totalProducts,
            totalOrders,
            totalUsers,
            pendingOrders
        ] = await Promise.all([
            db.collection('products').countDocuments(),
            db.collection('orders').countDocuments(),
            db.collection('users').countDocuments(),
            db.collection('orders').countDocuments({
                orderStatus: 'pending'
            })
        ]);

        res.json({
            totalProducts,
            totalOrders,
            totalUsers,
            pendingOrders
        });
    } catch (error) {
        next(error);
    }
}

// Get Admin Profile
async function getAdminProfile(req, res, next) {
    try {
        const db = getDb();

        const profile = await db.collection('users').findOne({
            firebaseUid: req.user.uid
        });

        if (!profile) {
            return res.status(404).json({
                error: 'Admin profile not found.'
            });
        }

        res.json({
            profile: {
                name: profile.name || '',
                email: profile.email || req.user.email,
                phone: profile.phone || '',
                photoURL: profile.photoURL || '',
                photoPublicId: profile.photoPublicId || ''
            }
        });
    } catch (error) {
        next(error);
    }
}

// Update Admin Profile
async function updateAdminProfile(req, res, next) {
    try {
        const db = getDb();

        const { name, phone, photoURL, photoPublicId } = req.body;

        if (
            typeof name !== 'string' ||
            !name.trim() ||
            name.trim().length > 80
        ) {
            return res.status(400).json({
                error: 'Please enter a valid name.'
            });
        }

        if (
            phone !== undefined &&
            (typeof phone !== 'string' || phone.length > 30)
        ) {
            return res.status(400).json({
                error: 'Invalid phone number.'
            });
        }

        if (photoURL !== undefined && photoURL !== '') {
            try {
                const imageUrl = new URL(photoURL);

                if (
                    imageUrl.protocol !== 'https:' ||
                    imageUrl.hostname !== 'res.cloudinary.com'
                ) {
                    throw new Error('Invalid URL');
                }
            } catch {
                return res.status(400).json({
                    error: 'Invalid profile image URL.'
                });
            }
        }

        const updateData = {
            name: name.trim(),
            updatedAt: new Date()
        };

        if (phone !== undefined) {
            updateData.phone = phone.trim();
        }

        if (photoURL !== undefined) {
            updateData.photoURL = photoURL;
        }

        if (photoPublicId !== undefined) {
            updateData.photoPublicId = photoPublicId;
        }

        const result = await db.collection('users').updateOne(
            { firebaseUid: req.user.uid },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: 'Admin profile not found.'
            });
        }

        const updatedProfile = await db.collection('users').findOne({
            firebaseUid: req.user.uid
        });

        res.json({
            message: 'Profile updated successfully.',
            profile: {
                name: updatedProfile.name,
                email: updatedProfile.email || req.user.email,
                phone: updatedProfile.phone || '',
                photoURL: updatedProfile.photoURL || '',
                photoPublicId: updatedProfile.photoPublicId || ''
            }
        });
    } catch (error) {
        next(error);
    }
}

// Dashboard Route
adminRouter.get(
    '/dashboard',
    requireAuth,
    requireAdmin,
    getDashboard
);

// Profile Routes
adminRouter.get(
    '/profile',
    requireAuth,
    requireAdmin,
    getAdminProfile
);

adminRouter.patch(
    '/profile',
    requireAuth,
    requireAdmin,
    updateAdminProfile
);
