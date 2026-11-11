
import { verifyFirebaseToken } from '../config/firebase.js';
import { getDb } from '../config/database.js';

export async function requireAuth(req, res, next) {
    try {
        console.log('\n--- AUTH DEBUG START ---');

        // Step 1: Check Authorization Header
        const authHeader = req.headers.authorization;

        console.log(
            'Authorization header received:',
            Boolean(authHeader)
        );

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('FAILED: Bearer token missing');

            return res.status(401).json({
                error: 'Authentication required'
            });
        }

        const token = authHeader.slice(7);

        // Step 2: Verify Firebase Token
        console.log('Verifying Firebase token...');

        const decoded = await verifyFirebaseToken(token);

        console.log('Firebase token verified successfully');

        // Step 3: Find User in MongoDB
        console.log('Searching MongoDB user profile...');

        const user = await getDb()
            .collection('users')
            .findOne({
                firebaseUid: decoded.uid
            });

        if (!user) {
            console.log('FAILED: User not found in MongoDB');

            return res.status(403).json({
                error: 'User profile not found'
            });
        }

        console.log('MongoDB user found');
        console.log('User role:', user.role);

        if (user.active === false) {
            console.log('FAILED: User account disabled');

            return res.status(403).json({
                error: 'Your account is disabled'
            });
        }

        req.user = {
            uid: decoded.uid,
            email: decoded.email || user.email,
            role: user.role || 'customer',
            id: user._id
        };

        console.log('Authentication successful');
        console.log('--- AUTH DEBUG END ---\n');

        next();

    } catch (error) {
        console.error(
            'AUTHENTICATION FAILED:',
            error.code || error.name
        );

        console.error('Error message:', error.message);

        return res.status(401).json({
            error: 'Invalid or expired authentication token'
        });
    }
}

// Admin Authorization Middleware
export function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        console.log('Admin permission denied');

        return res.status(403).json({
            error: 'Administrator access required'
        });
    }

    next();
}
