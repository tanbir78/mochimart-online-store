import { ObjectId } from 'mongodb';
import { getDb } from '../config/database.js';

export async function listProducts(req, res, next) {
    try {
        const db = getDb();

        const {
            q = '',
            category,
            sort = 'newest',
            page = '1',
            limit = '12'
        } = req.query;

        const p = Math.max(1, Number(page) || 1),
            l = Math.min(50, Math.max(1, Number(limit) || 12));

        const filter = { active: { $ne: false } };

        if (category) filter.category = String(category);
        if (q) filter.$text = { $search: String(q).slice(0, 100) };

        const sortMap = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            'price-asc': { price: 1 },
            'price-desc': { price: -1 },
            rating: { rating: -1 }
        };

        const [items, total] = await Promise.all([
            db.collection('products')
                .find(filter)
                .sort(sortMap[sort] || sortMap.newest)
                .skip((p - 1) * l)
                .limit(l)
                .toArray(),

            db.collection('products').countDocuments(filter)
        ]);

        res.json({
            items,
            total,
            page: p,
            pages: Math.ceil(total / l)
        });
    } catch (e) {
        next(e);
    }
}

export async function getProduct(req, res, next) {
    try {
        const db = getDb();
        const id = req.params.id;

        const product = ObjectId.isValid(id)
            ? await db.collection('products').findOne({
                _id: new ObjectId(id),
                active: { $ne: false }
            })
            : await db.collection('products').findOne({
                slug: id,
                active: { $ne: false }
            });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (e) {
        next(e);
    }
}