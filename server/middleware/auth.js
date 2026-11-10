import admin from 'firebase-admin';
import { getDb } from '../config/database.js';

let initialized = false;

function firebaseAdmin() {
    if (!initialized) {
        if (
            !process.env.FIREBASE_PROJECT_ID ||
            !process.env.FIREBASE_CLIENT_EMAIL ||
            !process.env.FIREBASE_PRIVATE_KEY
        )
            throw new Error('Firebase Admin credentials are missing');

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            })
        });

        initialized = true;
    }

    return admin;
}

export async function requireAuth(req, res, next) {
    try {
        const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');

        if (!token)
            return res.status(401).json({ error: 'Authentication required' });

        const decoded = await firebaseAdmin().auth().verifyIdToken(token);

        const user = await getDb()
            .collection('users')
            .findOne({ firebaseUid: decoded.uid });

        if (!user)
            return res.status(403).json({ error: 'User profile not found' });

        req.user = {
            uid: decoded.uid,
            email: decoded.email,
            role: user.role || 'customer',
            id: user._id
        };

        next();
    } catch (e) {
        res.status(401).json({
            error: 'Invalid or expired authentication token'
        });
    }
}

export function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin')
        return res.status(403).json({
            error: 'Administrator access required'
        });

    next();
}