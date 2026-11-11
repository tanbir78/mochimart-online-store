
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { getDb } from '../config/database.js';

export const adminRouter = Router();

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
                status: 'pending'
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

adminRouter.get(
    '/dashboard',
    requireAuth,
    requireAdmin,
    getDashboard
);
