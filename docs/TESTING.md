# Testing

- Backend tests: `npm --workspace server test`
- Frontend tests: `npm --workspace client test`
- Production frontend build: `npm run build`

The current backend unit tests cover minor-unit money conversion only. Authentication, checkout, stock concurrency, webhook idempotency, and browser E2E tests remain to be implemented.
