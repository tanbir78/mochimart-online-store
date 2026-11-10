
import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDb, getClient } from '../config/database.js';

export const orderRouter = Router();

// Create a new order with stock management
orderRouter.post('/', async (req, res, next) => {
    const session = getClient().startSession();

    try {
        const { customer, items } = req.body;

        // Validate customer information
        if (
            !customer ||
            typeof customer.name !== 'string' ||
            !customer.name.trim() ||
            typeof customer.phone !== 'string' ||
            !customer.phone.trim() ||
            typeof customer.address !== 'string' ||
            !customer.address.trim()
        ) {
            return res.status(400).json({
                error: 'Name, phone and delivery address are required.'
            });
        }

        // Validate order items
        if (
            !Array.isArray(items) ||
            items.length === 0 ||
            items.length > 50
        ) {
            return res.status(400).json({
                error: 'Invalid order items.'
            });
        }

        const productIds = [];

        for (const item of items) {
            if (
                !item.productId ||
                !ObjectId.isValid(item.productId) ||
                !Number.isInteger(item.quantity) ||
                item.quantity < 1 ||
                item.quantity > 100
            ) {
                return res.status(400).json({
                    error: 'Invalid product ID or quantity.'
                });
            }

            productIds.push(item.productId);
        }

        // Prevent duplicate product IDs
        if (new Set(productIds).size !== productIds.length) {
            return res.status(400).json({
                error: 'Duplicate products are not allowed.'
            });
        }

        const db = getDb();

        let createdOrder;

        // Start MongoDB transaction
        await session.withTransaction(async () => {
            const products = await db.collection('products')
                .find(
                    {
                        _id: {
                            $in: productIds.map((id) => new ObjectId(id))
                        },
                        active: true
                    },
                    { session }
                )
                .toArray();

            if (products.length !== items.length) {
                const error = new Error(
                    'One or more products are unavailable.'
                );

                error.status = 400;
                throw error;
            }

            const orderItems = [];

            // Validate stock and calculate subtotal
            for (const item of items) {
                const product = products.find(
                    (p) => p._id.toString() === item.productId
                );

                if (
                    !product ||
                    !Number.isInteger(product.stock) ||
                    product.stock < item.quantity
                ) {
                    const error = new Error(
                        `Insufficient stock for ${product?.name || 'a product'}.`
                    );

                    error.status = 409;
                    throw error;
                }

                if (
                    typeof product.price !== 'number' ||
                    !Number.isFinite(product.price) ||
                    product.price < 0
                ) {
                    const error = new Error('Invalid product price.');
                    error.status = 400;
                    throw error;
                }

                orderItems.push({
                    productId: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity,
                    lineTotal: product.price * item.quantity
                });
            }

            // Reduce stock atomically
            for (const item of orderItems) {
                const stockUpdate = await db.collection('products')
                    .updateOne(
                        {
                            _id: item.productId,
                            active: true,
                            stock: { $gte: item.quantity }
                        },
                        {
                            $inc: { stock: -item.quantity },
                            $set: { updatedAt: new Date() }
                        },
                        { session }
                    );

                if (stockUpdate.modifiedCount !== 1) {
                    const error = new Error(
                        `Stock is no longer available for ${item.name}.`
                    );

                    error.status = 409;
                    throw error;
                }
            }

            const subtotal = orderItems.reduce(
                (sum, item) => sum + item.lineTotal,
                0
            );

            const deliveryCharge = 60;
            const total = subtotal + deliveryCharge;

            const order = {
                customer: {
                    name: customer.name.trim(),
                    phone: customer.phone.trim(),
                    email: typeof customer.email === 'string'
                        ? customer.email.trim()
                        : '',
                    address: customer.address.trim()
                },

                items: orderItems,
                subtotal,
                deliveryCharge,
                total,

                paymentMethod: 'COD',
                paymentStatus: 'pending',
                orderStatus: 'pending',

                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await db.collection('orders')
                .insertOne(order, { session });

            createdOrder = {
                orderId: result.insertedId,
                total
            };
        });

        return res.status(201).json({
            message: 'Order placed successfully.',
            orderId: createdOrder.orderId,
            total: createdOrder.total
        });

    } catch (error) {
        next(error);
    } finally {
        await session.endSession();
    }
});
