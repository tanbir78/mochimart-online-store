
import { ObjectId } from 'mongodb';
import { getDb } from '../config/database.js';

// Recalculate product rating using approved reviews only
async function updateProductRating(productId) {
    const db = getDb();

    const result = await db.collection('reviews')
        .aggregate([
            {
                $match: {
                    productId: new ObjectId(productId),
                    status: 'approved'
                }
            },
            {
                $group: {
                    _id: '$productId',
                    averageRating: { $avg: '$rating' },
                    reviewCount: { $sum: 1 }
                }
            }
        ])
        .toArray();

    const rating = result[0]?.averageRating || 0;
    const reviewCount = result[0]?.reviewCount || 0;

    await db.collection('products').updateOne(
        { _id: new ObjectId(productId) },
        {
            $set: {
                rating: Number(rating.toFixed(1)),
                reviewCount,
                updatedAt: new Date()
            }
        }
    );
}

// Create a unique index for one review per customer per product
async function ensureReviewIndex() {
    await getDb().collection('reviews').createIndex(
        { productId: 1, userId: 1 },
        {
            unique: true,
            name: 'unique_customer_product_review'
        }
    );
}

// ========================================
// GET PRODUCT REVIEWS
// GET /api/reviews/:productId
// ========================================

export async function listProductReviews(req, res, next) {
    try {
        const { productId } = req.params;

        if (!ObjectId.isValid(productId)) {
            return res.status(400).json({
                error: 'Invalid product ID.'
            });
        }

        const db = getDb();

        const page = Math.max(
            1,
            parseInt(req.query.page, 10) || 1
        );

        const limit = Math.min(
            50,
            Math.max(1, parseInt(req.query.limit, 10) || 10)
        );

        const filter = {
            productId: new ObjectId(productId),
            status: 'approved'
        };

        const [reviews, total, summary] = await Promise.all([
            db.collection('reviews')
                .find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .project({
                    userId: 0
                })
                .toArray(),

            db.collection('reviews').countDocuments(filter),

            db.collection('reviews')
                .aggregate([
                    { $match: filter },
                    {
                        $group: {
                            _id: null,
                            averageRating: { $avg: '$rating' },
                            totalReviews: { $sum: 1 }
                        }
                    }
                ])
                .toArray()
        ]);

        return res.json({
            reviews,
            summary: {
                averageRating: Number(
                    (summary[0]?.averageRating || 0).toFixed(1)
                ),
                totalReviews: total
            },
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalReviews: total,
                limit
            }
        });

    } catch (error) {
        next(error);
    }
}

// ========================================
// CREATE PRODUCT REVIEW
// POST /api/reviews/:productId
// ========================================

export async function createReview(req, res, next) {
    try {
        const { productId } = req.params;
        const { rating, comment } = req.body;

        if (!ObjectId.isValid(productId)) {
            return res.status(400).json({
                error: 'Invalid product ID.'
            });
        }

        if (
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            return res.status(400).json({
                error: 'Rating must be between 1 and 5.'
            });
        }

        if (
            typeof comment !== 'string' ||
            comment.trim().length < 5 ||
            comment.trim().length > 2000
        ) {
            return res.status(400).json({
                error: 'Review must contain 5 to 2000 characters.'
            });
        }

        if (req.user.role !== 'customer') {
            return res.status(403).json({
                error: 'Customer access required.'
            });
        }

        const db = getDb();
        const reviews = db.collection('reviews');
        const productObjectId = new ObjectId(productId);

        await ensureReviewIndex();

        // Check product availability
        const product = await db.collection('products').findOne({
            _id: productObjectId,
            active: { $ne: false }
        });

        if (!product) {
            return res.status(404).json({
                error: 'Product not found.'
            });
        }

        // Verify that this customer purchased and received the product
        const eligibleOrder = await db.collection('orders').findOne({
            userId: req.user.uid,
            orderStatus: 'delivered',
            'items.productId': productObjectId
        });

        if (!eligibleOrder) {
            return res.status(403).json({
                error: 'You can review this product after receiving it.'
            });
        }

        const existingReview = await reviews.findOne({
            productId: productObjectId,
            userId: req.user.uid
        });

        if (existingReview) {
            return res.status(409).json({
                error: 'You have already reviewed this product.'
            });
        }

        const review = {
            productId: productObjectId,
            userId: req.user.uid,
            userName: req.user.email || 'Customer',
            rating,
            comment: comment.trim(),
            verifiedPurchase: true,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await reviews.insertOne(review);

        return res.status(201).json({
            message: 'Review submitted successfully. It will appear after approval.',
            review: {
                ...review,
                _id: result.insertedId
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                error: 'You have already reviewed this product.'
            });
        }

        next(error);
    }
}

// ========================================
// UPDATE OWN REVIEW
// PATCH /api/reviews/:id
// ========================================

export async function updateReview(req, res, next) {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: 'Invalid review ID.'
            });
        }

        if (
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            return res.status(400).json({
                error: 'Rating must be between 1 and 5.'
            });
        }

        if (
            typeof comment !== 'string' ||
            comment.trim().length < 5 ||
            comment.trim().length > 2000
        ) {
            return res.status(400).json({
                error: 'Review must contain 5 to 2000 characters.'
            });
        }

        const db = getDb();
        const reviews = db.collection('reviews');

        const existingReview = await reviews.findOne({
            _id: new ObjectId(id),
            userId: req.user.uid
        });

        if (!existingReview) {
            return res.status(404).json({
                error: 'Review not found.'
            });
        }

        await reviews.updateOne(
            {
                _id: new ObjectId(id),
                userId: req.user.uid
            },
            {
                $set: {
                    rating,
                    comment: comment.trim(),
                    status: 'pending',
                    updatedAt: new Date()
                }
            }
        );

        await updateProductRating(existingReview.productId);

        return res.json({
            message: 'Review updated and submitted for approval.'
        });

    } catch (error) {
        next(error);
    }
}

// ========================================
// DELETE OWN REVIEW
// DELETE /api/reviews/:id
// ========================================

export async function deleteReview(req, res, next) {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                error: 'Invalid review ID.'
            });
        }

        const db = getDb();

        const review = await db.collection('reviews').findOne({
            _id: new ObjectId(id),
            userId: req.user.uid
        });

        if (!review) {
            return res.status(404).json({
                error: 'Review not found.'
            });
        }

        await db.collection('reviews').deleteOne({
            _id: new ObjectId(id),
            userId: req.user.uid
        });

        await updateProductRating(review.productId);

        return res.json({
            message: 'Review deleted successfully.'
        });

    } catch (error) {
        next(error);
    }
}
