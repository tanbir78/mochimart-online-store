
import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { getDb, getClient } from '../config/database.js';

export const adminRouter = Router();

const ORDER_STATUSES = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
];

const PAYMENT_STATUSES = [
    'pending',
    'paid',
    'failed',
    'refunded'
];

// Escape special regex characters
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

// Get All Orders
async function getAllOrders(req, res, next) {
    try {
        const db = getDb();

        const search = typeof req.query.search === 'string'
            ? req.query.search.trim().slice(0, 100)
            : '';

        const status = typeof req.query.status === 'string'
            ? req.query.status
            : '';

        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            50,
            Math.max(1, parseInt(req.query.limit, 10) || 10)
        );

        if (status && !ORDER_STATUSES.includes(status)) {
            return res.status(400).json({
                error: 'Invalid order status.'
            });
        }

        const filter = {};

        if (status) {
            filter.orderStatus = status;
        }

        if (search) {
            const searchRegex = new RegExp(escapeRegex(search), 'i');

            const searchConditions = [
                { 'customer.name': searchRegex },
                { 'customer.phone': searchRegex }
            ];

            if (ObjectId.isValid(search)) {
                searchConditions.push({
                    _id: new ObjectId(search)
                });
            }

            filter.$or = searchConditions;
        }

        const skip = (page - 1) * limit;

        const [orders, totalOrders] = await Promise.all([
            db.collection('orders')
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),

            db.collection('orders').countDocuments(filter)
        ]);

        res.json({
            orders,
            pagination: {
                currentPage: page,
                limit,
                totalOrders,
                totalPages: Math.ceil(totalOrders / limit)
            }
        });
    } catch (error) {
        next(error);
    }
}

// Get Single Order Details
async function getOrderDetails(req, res, next) {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: 'Invalid order ID.'
            });
        }

        const db = getDb();

        const order = await db.collection('orders').findOne({
            _id: new ObjectId(id)
        });

        if (!order) {
            return res.status(404).json({
                error: 'Order not found.'
            });
        }

        res.json({ order });
    } catch (error) {
        next(error);
    }
}

// Update Order Status
async function updateOrderStatus(req, res, next) {
    const session = getClient().startSession();

    try {
        const { id } = req.params;
        const { orderStatus } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: 'Invalid order ID.'
            });
        }

        if (!ORDER_STATUSES.includes(orderStatus)) {
            return res.status(400).json({
                error: 'Invalid order status.'
            });
        }

        const db = getDb();
        const orderId = new ObjectId(id);

        let updatedOrder;

        await session.withTransaction(async () => {
            const order = await db.collection('orders').findOne(
                { _id: orderId },
                { session }
            );

            if (!order) {
                const error = new Error('Order not found.');
                error.status = 404;
                throw error;
            }

            if (order.orderStatus === 'cancelled') {
                const error = new Error(
                    'A cancelled order cannot be updated.'
                );
                error.status = 409;
                throw error;
            }

            if (
                orderStatus === 'cancelled' &&
                order.orderStatus === 'delivered'
            ) {
                const error = new Error(
                    'A delivered order cannot be cancelled.'
                );
                error.status = 409;
                throw error;
            }

            // Restore product stock when cancelling an order
            if (orderStatus === 'cancelled') {
                const stockOperations = (order.items || [])
                    .filter(item =>
                        item.productId &&
                        Number.isInteger(item.quantity) &&
                        item.quantity > 0
                    )
                    .map(item => ({
                        updateOne: {
                            filter: { _id: item.productId },
                            update: {
                                $inc: { stock: item.quantity },
                                $set: { updatedAt: new Date() }
                            }
                        }
                    }));

                if (stockOperations.length > 0) {
                    await db.collection('products').bulkWrite(
                        stockOperations,
                        { session }
                    );
                }
            }

            await db.collection('orders').updateOne(
                { _id: orderId },
                {
                    $set: {
                        orderStatus,
                        updatedAt: new Date()
                    }
                },
                { session }
            );

            updatedOrder = await db.collection('orders').findOne(
                { _id: orderId },
                { session }
            );
        });

        res.json({
            message: 'Order status updated successfully.',
            order: updatedOrder
        });
    } catch (error) {
        next(error);
    } finally {
        await session.endSession();
    }
}

// Update Payment Status
async function updatePaymentStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: 'Invalid order ID.'
            });
        }

        if (!PAYMENT_STATUSES.includes(paymentStatus)) {
            return res.status(400).json({
                error: 'Invalid payment status.'
            });
        }

        const db = getDb();

        const result = await db.collection('orders').findOneAndUpdate(
            { _id: new ObjectId(id) },
            {
                $set: {
                    paymentStatus,
                    updatedAt: new Date()
                }
            },
            {
                returnDocument: 'after'
            }
        );

        if (!result) {
            return res.status(404).json({
                error: 'Order not found.'
            });
        }

        res.json({
            message: 'Payment status updated successfully.',
            order: result
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

// Order Management Routes
adminRouter.get(
    '/orders',
    requireAuth,
    requireAdmin,
    getAllOrders
);

adminRouter.get(
    '/orders/:id',
    requireAuth,
    requireAdmin,
    getOrderDetails
);

adminRouter.patch(
    '/orders/:id/status',
    requireAuth,
    requireAdmin,
    updateOrderStatus
);

adminRouter.patch(
    '/orders/:id/payment',
    requireAuth,
    requireAdmin,
    updatePaymentStatus
);
