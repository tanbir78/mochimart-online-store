
import { verifyFirebaseToken } from '../config/firebase.js';
import { getDb } from '../config/database.js';

// Verify Firebase token only (for registration)
export async function requireFirebaseAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Authentication required.'
            });
        }

        const token = authHeader.slice(7);
        const decoded = await verifyFirebaseToken(token);

        req.firebaseUser = {
            uid: decoded.uid,
            email: decoded.email || '',
            name: decoded.name || '',
            emailVerified: decoded.email_verified || false
        };

        next();
    } catch (error) {
        console.error('Firebase authentication failed:', error.code || error.name);

        return res.status(401).json({
            error: 'Invalid or expired authentication token.'
        });
    }
}

// Verify Firebase token and MongoDB user profile
export async function requireAuth(req, res, next) {
    try {
        await requireFirebaseAuth(req, res, async () => {
            const decoded = req.firebaseUser;

            const user = await getDb()
                .collection('users')
                .findOne({
                    firebaseUid: decoded.uid
                });

            if (!user) {
                return res.status(403).json({
                    error: 'User profile not found.'
                });
            }

            if (user.active === false) {
                return res.status(403).json({
                    error: 'Your account is disabled.'
                });
            }

            req.user = {
                uid: decoded.uid,
                email: decoded.email || user.email,
                role: user.role || 'customer',
                id: user._id
            };

            next();
        });
    } catch (error) {
        console.error('AUTHENTICATION FAILED:', error.code || error.name);

        return res.status(500).json({
            error: 'Authentication service error.'
        });
    }
}

// Admin Authorization Middleware
export function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({
            error: 'Administrator access required.'
        });
    }

    next();
}
