
import { Router } from 'express';
import { getDb } from '../config/database.js';
import { requireAuth, requireFirebaseAuth } from '../middleware/auth.js';

export const authRouter = Router();


// ========================================
// Get Logged-in User Profile
// GET /api/auth/me
// ========================================
authRouter.get('/me', requireAuth, async (req, res, next) => {
    try {
        const user = await getDb().collection('users').findOne({
            firebaseUid: req.user.uid
        });

        if (!user) {
            return res.status(404).json({
                error: 'User profile not found.'
            });
        }

        res.json({
            user: {
                id: user._id,
                name: user.name || '',
                email: user.email || req.user.email,
                phone: user.phone || '',
                role: user.role || 'customer',
                photoURL: user.photoURL || ''
            }
        });
    } catch (error) {
        next(error);
    }
});


// ========================================
// Customer Registration
// POST /api/auth/register
// ========================================
authRouter.post(
    '/register',
    requireFirebaseAuth,
    async (req, res, next) => {
        try {
            const { name, phone } = req.body;
            const firebaseUser = req.firebaseUser;

            // Validate customer name
            if (
                typeof name !== 'string' ||
                !name.trim() ||
                name.trim().length > 80
            ) {
                return res.status(400).json({
                    error: 'Please enter a valid name.'
                });
            }

            // Validate customer phone
            if (
                typeof phone !== 'string' ||
                !phone.trim() ||
                phone.trim().length > 30
            ) {
                return res.status(400).json({
                    error: 'Please enter a valid phone number.'
                });
            }

            // Validate Firebase email
            if (!firebaseUser.email) {
                return res.status(400).json({
                    error: 'A valid email address is required.'
                });
            }

            const db = getDb();
            const usersCollection = db.collection('users');

            // Check existing user
            const existingUser = await usersCollection.findOne({
                firebaseUid: firebaseUser.uid
            });

            if (existingUser) {
                if (existingUser.role === 'admin') {
                    return res.status(403).json({
                        error: 'Admin accounts cannot register as customers.'
                    });
                }

                return res.status(409).json({
                    error: 'An account profile already exists.'
                });
            }

            // Create customer profile
            const customer = {
                firebaseUid: firebaseUser.uid,
                name: name.trim(),
                email: firebaseUser.email.toLowerCase(),
                phone: phone.trim(),
                role: 'customer',
                active: true,
                photoURL: '',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await usersCollection.insertOne(customer);

            return res.status(201).json({
                message: 'Customer account created successfully.',
                customer: {
                    id: result.insertedId,
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    role: customer.role
                }
            });

        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({
                    error: 'An account already exists.'
                });
            }

            next(error);
        }
    }
);



// ========================================
// Update Customer Profile
// PATCH /api/auth/me
// ========================================

authRouter.patch('/me', requireAuth, async (req, res, next) => {
    try {
        const { name, phone, photoURL, photoPublicId } = req.body;

        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({
                error: 'Name is required.'
            });
        }

        if (name.trim().length > 80) {
            return res.status(400).json({
                error: 'Name cannot exceed 80 characters.'
            });
        }

        if (typeof phone !== 'string' || phone.trim().length > 30) {
            return res.status(400).json({
                error: 'Invalid phone number.'
            });
        }

        if (photoURL !== undefined && typeof photoURL !== 'string') {
            return res.status(400).json({
                error: 'Invalid profile image URL.'
            });
        }

        if (photoPublicId !== undefined && typeof photoPublicId !== 'string') {
            return res.status(400).json({
                error: 'Invalid profile image ID.'
            });
        }

        const users = getDb().collection('users');

        const updateFields = {
            name: name.trim(),
            phone: phone.trim(),
            updatedAt: new Date()
        };

        if (photoURL !== undefined) {
            updateFields.photoURL = photoURL;
        }

        if (photoPublicId !== undefined) {
            updateFields.photoPublicId = photoPublicId;
        }

        const result = await users.updateOne(
            {
                firebaseUid: req.user.uid,
                role: 'customer'
            },
            {
                $set: updateFields
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: 'Customer profile not found.'
            });
        }

        const updatedUser = await users.findOne(
            { firebaseUid: req.user.uid },
            {
                projection: {
                    name: 1,
                    email: 1,
                    phone: 1,
                    photoURL: 1,
                    role: 1
                }
            }
        );

        return res.json({
            message: 'Customer profile updated successfully.',
            profile: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                photoURL: updatedUser.photoURL || '',
                role: updatedUser.role
            }
        });
    } catch (error) {
        next(error);
    }
});
