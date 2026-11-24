
import { Router } from 'express';
import {
    listProductReviews,
    createReview,
    updateReview,
    deleteReview
} from '../controllers/reviews.js';
import { requireAuth } from '../middleware/auth.js';

export const reviewRouter = Router();

// Public: Get approved reviews for a product
reviewRouter.get('/:productId', listProductReviews);

// Customer: Submit a review
reviewRouter.post('/:productId', requireAuth, createReview);

// Customer: Update own review
reviewRouter.patch('/:id', requireAuth, updateReview);

// Customer: Delete own review
reviewRouter.delete('/:id', requireAuth, deleteReview);
