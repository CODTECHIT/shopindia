# Environment Variables

This project uses Vite, so runtime environment variables must be prefixed with `VITE_` to be accessible in browser code via `import.meta.env`.

## Frontend (project root `.env`)

- `VITE_API_URL` — base URL of the ShopIndia REST API (e.g. `https://api.example.com`)
- `VITE_COGNITO_USER_POOL_ID` — AWS Cognito User Pool ID
- `VITE_COGNITO_CLIENT_ID` — AWS Cognito App Client ID
- `VITE_AWS_REGION` — AWS region (e.g. `us-east-1`)
- `VITE_CLOUDFRONT_URL` — CloudFront distribution URL for assets

## Server (`server/.env`)

- `PORT` — server port (default `5001`)
- `NODE_ENV` — `production` in deployed environments
- `FRONTEND_URL` — origin allowed by CORS (must match the deployed frontend domain)
- `DATABASE_URL` — PostgreSQL / Amazon RDS connection string (Prisma)
- `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID` — AWS Cognito config
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `CLOUDFRONT_DOMAIN` — S3/CloudFront asset storage
- `JWT_SECRET` — development fallback only; generate a strong random value in production

## Local Development File

- Create `.env` in the repo root (frontend) and `server/.env` (backend).
- Restart `npm run dev` after changing `.env`.
