import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (req, res) =>
    res.json({
        status: 'ok',
        service: 'mochimart-api',
        timestamp: new Date().toISOString()
    })
);