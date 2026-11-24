
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import {
    connectDatabase,
    closeDatabase
} from './config/database.js';

import { initializeFirebaseAdmin } from './config/firebase.js';

import { productRouter } from './routes/products.js';
import { healthRouter } from './routes/health.js';
import { orderRouter } from './routes/orders.js';
import { uploadRouter } from './routes/uploads.js';
import { adminRouter } from './routes/admin.js';
import { authRouter } from './routes/auth.js';
import { reviewRouter } from './routes/reviews.js';

const app = express();

let server;
let isShuttingDown = false;

// ========================================
// Process Error Logging
// ========================================

process.on('unhandledRejection', (reason) => {
    console.error(
        '[UNHANDLED PROMISE REJECTION]',
        reason
    );
});

process.on('uncaughtException', (error) => {
    console.error(
        '[UNCAUGHT EXCEPTION]',
        error
    );

    shutdown('uncaughtException');
});

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
            if (!origin) {
                return callback(null, true);
            }

            const normalizedOrigin = origin.replace(/\/$/, '');

            if (allowedOrigins.includes(normalizedOrigin)) {
                return callback(null, true);
            }

            console.error('[CORS BLOCKED]', origin);

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
// JSON Body Parser
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
// Request Logging (Development Only)
// ========================================

if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        const start = Date.now();

        res.on('finish', () => {
            console.log(
                `[API] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${Date.now() - start}ms`
            );
        });

        next();
    });
}

// ========================================
// API Routes
// ========================================

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/uploads', uploadRouter);
app.use('/api/admin', adminRouter);
app.use('/api/reviews', reviewRouter);

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
    console.error('[SERVER ERROR]', {
        method: req.method,
        url: req.originalUrl,
        message: err.message,
        stack: err.stack
    });

    if (res.headersSent) {
        return next(err);
    }

    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            error: 'Frontend origin is not allowed.'
        });
    }

    return res.status(err.status || 500).json({
        error:
            process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : err.message
    });
});

// ========================================
// Health Check
// ========================================

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'mochimart-api'
    });
});

// ========================================
// Graceful Shutdown
// ========================================

async function shutdown(signal) {
    if (isShuttingDown) return;

    isShuttingDown = true;

    console.log(`[SERVER] ${signal} received. Shutting down...`);

    try {
        if (server) {
            await new Promise((resolve, reject) => {
                server.close((error) => {
                    if (error) reject(error);
                    else resolve();
                });
            });
        }

        await closeDatabase();

        console.log('[SERVER] Shutdown completed.');
        process.exit(0);

    } catch (error) {
        console.error('[SERVER] Shutdown error:', error);
        process.exit(1);
    }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// ========================================
// Start Server
// ========================================

const port = Number(process.env.PORT || 5000);

async function startServer() {
    try {
        await connectDatabase();

        initializeFirebaseAdmin();

        server = app.listen(port, () => {
            console.log('================================');
            console.log('MochiMart API Server Started');
            console.log(`Port: ${port}`);
            console.log('Allowed Origins:', allowedOrigins);
            console.log('Environment:', process.env.NODE_ENV || 'development');
            console.log('================================');
        });

        server.on('error', (error) => {
            console.error('[HTTP SERVER ERROR]', error);
        });

    } catch (error) {
        console.error('[SERVER STARTUP FAILED]', error);
        process.exit(1);
    }
}

if (process.env.NODE_ENV !== 'test') {
    startServer();
}

export default app;
