# Deployment

## Frontend (Vercel)
1. Import the repository and set the project root to `client`.
2. Build command: `npm run build`; output directory: `dist`.
3. Add all `VITE_*` variables from `client/.env.example`.
4. Add an SPA rewrite to `/index.html` for client-side routes.
5. Set `VITE_API_URL` to the deployed API origin.

## Backend
1. Deploy `server` to a Node.js host that supports Express and raw Stripe webhook bodies.
2. Configure every variable in `server/.env.example`.
3. Restrict `CLIENT_URL` to the production frontend origin.
4. Configure MongoDB Atlas network access and database user.
5. Configure Firebase Admin credentials and Cloudinary credentials.
6. Configure Stripe webhook to `/api/payments/webhook` only after the webhook handler is implemented.
7. Verify `/api/health` and perform checkout tests in Stripe test mode.

No live deployment has been performed from this workspace.
