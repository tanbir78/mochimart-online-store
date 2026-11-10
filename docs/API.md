# API Reference

Base URL: `http://localhost:5000/api`

## Health
- `GET /health` — service status.

## Products
- `GET /products?q=&category=&sort=&page=&limit=` — active catalogue with pagination.
- `GET /products/:id` — product by MongoDB ObjectId or slug.

The protected/admin endpoints for order, checkout, customer, category, inventory, coupon and review workflows are scheduled in the implementation backlog and must not be assumed available until added and tested. All write endpoints must validate payloads and enforce ownership/role checks.
