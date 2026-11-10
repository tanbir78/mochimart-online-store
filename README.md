# MochiMart 🍡

**Your Happy Little Shopping Place** — a responsive single-vendor e-commerce starter built with React, Vite, Tailwind, Express, MongoDB, Firebase and Stripe integration foundations.

## Current implementation status
This repository is an initial implementation foundation, not yet a complete production store. The homepage, shop preview, product preview, cart empty state, login placeholder, admin overview placeholder, Express health endpoint, product read APIs, MongoDB connection/index setup, security middleware baseline and documentation are present. Checkout, customer/admin CRUD, Firebase client auth flows, Stripe PaymentIntents/webhooks, Cloudinary uploads and remaining workflows are not yet complete.

## Features in this foundation
- MochiMart responsive storefront and branded design system.
- Light/dark theme toggle foundation.
- React Router and TanStack Query setup.
- Express API with Helmet, CORS and rate limiting.
- MongoDB native driver connection and initial indexes.
- Product listing/search pagination and product detail API.
- Environment templates and deployment/testing documentation.

## Stack
React, Vite, Tailwind CSS, DaisyUI, React Router, TanStack Query, Firebase SDK, Express, MongoDB Native Driver, Firebase Admin, Stripe, Cloudinary, Vitest and Node test runner.

## Project structure
`client/` frontend · `server/` API · `docs/` technical documentation.

## Requirements
Node.js 20+, npm, MongoDB Atlas/local MongoDB. Firebase, Stripe and Cloudinary accounts are needed for their respective integrations.

## Installation
```bash
npm install
cp client/.env.example client/.env
cp server/.env.example server/.env
```
Fill placeholders locally. Never commit `.env` files.

## Run locally
```bash
npm run dev
```
Frontend: http://localhost:5173 · API: http://localhost:5000/api/health

## Build and test
```bash
npm run build
npm --workspace server test
npm --workspace client test
```

## External setup
- Firebase: create a project, enable Email/Password and Google providers, register the web app, and create a server service account.
- MongoDB: create an Atlas cluster/database user and configure `MONGODB_URI`.
- Stripe: use test mode credentials; webhook support is pending implementation.
- Cloudinary: create an account and configure backend credentials; upload route is pending implementation.

## Security
Never put Firebase Admin, Stripe secret, Cloudinary secret or MongoDB credentials in `VITE_*` variables. Initial admin bootstrap is not implemented; the configured email alone must never grant admin access.

## SEO
This is a Vite single-page app. It includes basic document metadata; for strong crawlability, add prerendering or migrate public product routes to an SSR framework.

## Screenshots
Add verified screenshots here after running the application.

See `docs/` for API, database, deployment and testing notes.

## Current verification note (2026-11-10)
Dependency installation timed out in the execution environment, so no frontend build or test run is verified. Run `npm install` on a machine with npm registry access, then execute the build and test commands above.
# mochimart-online-store
