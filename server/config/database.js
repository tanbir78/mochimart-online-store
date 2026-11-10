
import { MongoClient } from 'mongodb';

let client;
let db;

// Connect to MongoDB
export async function connectDatabase() {
    if (!process.env.MONGODB_URI) {
        throw new Error('Missing MONGODB_URI');
    }

    client = new MongoClient(process.env.MONGODB_URI);

    await client.connect();

    db = client.db(process.env.DB_NAME || 'mochimart');

    // Create database indexes
    await Promise.all([
        db.collection('products').createIndex(
            { slug: 1 },
            { unique: true }
        ),

        db.collection('products').createIndex({
            name: 'text',
            description: 'text'
        }),

        db.collection('users').createIndex(
            { firebaseUid: 1 },
            { unique: true }
        ),

        db.collection('orders').createIndex({
            userId: 1,
            createdAt: -1
        })
    ]);

    console.log('MongoDB connected successfully');

    return db;
}

// Get database instance
export function getDb() {
    if (!db) {
        throw new Error('Database is not connected');
    }

    return db;
}

// Get MongoDB client instance
export function getClient() {
    if (!client) {
        throw new Error('Database client is not connected');
    }

    return client;
}

// Close database connection
export async function closeDatabase() {
    if (client) {
        await client.close();
    }

    client = null;
    db = null;
}
