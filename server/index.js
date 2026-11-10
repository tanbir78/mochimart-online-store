import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { connectDatabase } from './config/database.js';
import { productRouter } from './routes/products.js';
import { healthRouter } from './routes/health.js';
import { orderRouter } from './routes/orders.js';
import { uploadRouter } from './routes/uploads.js';

const app = express();

// Security middleware
app.use(helmet());

app.use(
    cors({
        origin: process.env.CLIENT_URL?.split(',') || 'http://localhost:5173'
    })
);

// Payment webhook raw body
app.use(
    '/api/payments/webhook',
    express.raw({ type: 'application/json' })
);

// Parse JSON request body
app.use(express.json({ limit: '1mb' }));

// API rate limiting
app.use(
    '/api',
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 300,
        standardHeaders: true,
        legacyHeaders: false
    })
);

// API routes
app.use('/api/health', healthRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/uploads', uploadRouter);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.status || 500).json({
        error:
            process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : err.message
    });
});

// Server port
const port = Number(process.env.PORT || 5000);

// Connect database and start server
if (process.env.NODE_ENV !== 'test') {
    connectDatabase()
        .then(() => {
            app.listen(port, () => {
                console.log(`MochiMart API listening on ${port}`);
            });
        })
        .catch((error) => {
            console.error('Database startup failed:', error.message);
            process.exit(1);
        });
}

export default app;
