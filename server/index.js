
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { connectDatabase } from './config/database.js';
import { initializeFirebaseAdmin } from './config/firebase.js';

import { productRouter } from './routes/products.js';
import { healthRouter } from './routes/health.js';
import { orderRouter } from './routes/orders.js';
import { uploadRouter } from './routes/uploads.js';
import { adminRouter } from './routes/admin.js';
import { authRouter } from './routes/auth.js';

const app = express();

// ========================================
// Security Middleware
// ========================================

app.use(helmet());

// ========================================
// CORS Configuration
// ========================================

const allowedOrigins = (
    process.env.CLIENT_URL || 'http://localhost:5173'
)
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests without an origin (Postman, etc.)
            if (!origin) {
                return callback(null, true);
            }

            const normalizedOrigin = origin.replace(/\/$/, '');

            if (allowedOrigins.includes(normalizedOrigin)) {
                return callback(null, true);
            }

            console.log('CORS blocked origin:', origin);

            return callback(
                new Error('Not allowed by CORS')
            );
        },
        methods: [
            'GET',
            'POST',
            'PUT',
            'PATCH',
            'DELETE',
            'OPTIONS'
        ],
        allowedHeaders: [
            'Content-Type',
            'Authorization'
        ]
    })
);

// ========================================
// Payment Webhook Raw Body
// ========================================

app.use(
    '/api/payments/webhook',
    express.raw({
        type: 'application/json'
    })
);

// ========================================
// Parse JSON Request Body
// ========================================

app.use(
    express.json({
        limit: '1mb'
    })
);

// ========================================
// API Rate Limiting
// ========================================

app.use(
    '/api',
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 300,
        standardHeaders: true,
        legacyHeaders: false
    })
);

// ========================================
// API Routes
// ========================================

app.use('/api/health', healthRouter);

app.use('/api/auth', authRouter);

app.use('/api/products', productRouter);

app.use('/api/orders', orderRouter);

app.use('/api/uploads', uploadRouter);

app.use('/api/admin', adminRouter);

// ========================================
// 404 Handler
// ========================================

app.use((req, res) => {
    res.status(404).json({
        error: 'API endpoint not found.'
    });
});

// ========================================
// Global Error Handler
// ========================================

app.use((err, req, res, next) => {
    console.error('Server Error:', err);

    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            error: 'Frontend origin is not allowed.'
        });
    }

    res.status(err.status || 500).json({
        error:
            process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : err.message
    });
});

// ========================================
// Server Port
// ========================================

const port = Number(process.env.PORT || 5000);

// ========================================
// Connect Database and Start Server
// ========================================

if (process.env.NODE_ENV !== 'test') {
    connectDatabase()
        .then(() => {
            initializeFirebaseAdmin();

            app.listen(port, () => {
                console.log('================================');
                console.log('MochiMart API Server Started');
                console.log(`Port: ${port}`);
                console.log('Allowed Origins:', allowedOrigins);
                console.log('================================');
            });
        })
        .catch((error) => {
            console.error(
                'Server startup failed:',
                error.message
            );

            process.exit(1);
        });
}

export default app;
