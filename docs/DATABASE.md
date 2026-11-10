# Database Design

Database: `mochimart_admin` (MongoDB).

Collections planned: `users`, `products`, `categories`, `carts`, `wishlists`, `orders`, `payments`, `reviews`, `coupons`, `couponRedemptions`, `inventoryMovements`, `returnRequests`, `orderEvents`, `storeSettings`, `banners`, `newsletterSubscribers`.

Implemented indexes at startup: unique `products.slug`; text index on product name/description; unique `users.firebaseUid`; compound `orders.userId + createdAt`.

Money should be stored as integer minor units (e.g. paisa/cents) with an explicit currency code. Order items should store immutable product/price snapshots. Use MongoDB transactions for multi-document stock/order updates when the Atlas deployment supports transactions.
