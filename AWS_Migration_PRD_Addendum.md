# AWS Full-Stack Migration — PRD Addendum
## Supersedes Section 11 & 12 of Marketplace_Platform_PRD.md
### Scope: Admin Panel (MOD-05) + Vendor Panel (MOD-02) — already implemented on MongoDB+JWT

---

## 0. Context for the Agent

The Admin and Vendor panels were already built on **MongoDB (Mongoose) + custom JWT/RBAC middleware**, with a working build (`tsc -b && vite build` passing, 0 errors).

**Management decision:** Standardize the entire project on native AWS managed services instead of MongoDB Atlas + custom JWT. This addendum defines the target architecture and migration steps. Treat this as **replacing** Section 11 (Technology Stack) and Section 12 (Data Model Hints) of `Marketplace_Platform_PRD.md` for the backend/data/auth layers only. Frontend React/Vite/Tailwind structure remains unchanged.

---

## 1. Target AWS Architecture

```
AWS Account
├── Amazon S3        → Product/vendor images, videos, documents
├── Amazon RDS        → User data (PostgreSQL — replaces MongoDB)
├── Amazon Cognito    → Login & Authentication (replaces custom JWT/OTP)
├── EC2               → Backend API (Express app, replaces localhost:5001 dev server)
├── CloudFront        → CDN for static assets + video/image delivery from S3
└── IAM                → Permissions & security (service roles, least-privilege policies)
```

**Decision — EC2 over Lambda for backend API:** Since the Express/Mongoose-style REST API is already built as a long-running server (not function-per-route), migrating to EC2 (rehost) is far less rework than refactoring into Lambda handlers. Lambda can be revisited later for specific async jobs (e.g., notification dispatch, image processing) but is **not** the primary API host for this pass.

---

## 2. Database Migration: MongoDB → Amazon RDS (PostgreSQL)

### 2.1 Why this changes things
Mongoose schemas (document-based, nested arrays/sub-documents) must be re-modeled as **relational tables with foreign keys**. This is not a lift-and-shift — it's a schema redesign.

### 2.2 Table Mapping (from existing Mongoose models)

| Old MongoDB Collection | New RDS Table(s) | Notes |
|---|---|---|
| `User` | `users` | `role` as ENUM type (`super_admin, branch_manager, support_exec, vendor, rider, customer`) |
| `Vendor` | `vendors`, `vendor_documents` | Documents array → separate table with `vendor_id` FK |
| `Product` | `products`, `product_variants`, `product_images` | Variants/images arrays → child tables with `product_id` FK |
| `Order` | `orders`, `order_items` | Items array → child table with `order_id` FK |
| `Branch` | `branches`, `branch_staff` | Staff array → join table (`branch_id`, `user_id`) |
| `Role` | `roles`, `role_permissions` | Permissions array → child table |
| `Ticket` | `tickets`, `ticket_messages` | Messages array → child table with `ticket_id` FK |
| `ServiceArea` | `service_areas`, `service_area_pincodes` | Pincodes array → child table |

### 2.3 Key relational constraints to add
- `vendors.approval_status` → ENUM (`pending, approved, rejected, suspended`)
- `orders.status` → ENUM per order type status machine (FR-01.6 / FR-02.3)
- Foreign keys: `products.vendor_id → vendors.id`, `orders.vendor_id → vendors.id`, `branch_staff.branch_id/user_id`, etc. — all `ON DELETE RESTRICT` unless soft-delete is preferred (recommend soft-delete via `deleted_at` timestamp columns, not hard deletes, for audit trail).
- `vendors.commission_rate` — `DECIMAL(5,2)`, default `10.00` (per Open Question resolution already agreed).

### 2.4 ORM
Replace Mongoose with **Prisma** (recommended) or **Sequelize/TypeORM** for Node.js + PostgreSQL. Prisma preferred for TypeScript type-safety matching the existing Vite+TS frontend conventions.

### 2.5 RDS instance config (starter, cost-conscious)
- Engine: PostgreSQL (latest stable)
- Instance class: `db.t3.micro` or `db.t4g.micro` (free-tier eligible, 12 months)
- Multi-AZ: **off** for dev/staging, revisit for production
- Storage: 20GB gp3, autoscaling enabled

---

## 3. Auth Migration: Custom JWT → Amazon Cognito

### 3.1 What changes
- Remove: `bcryptjs` password hashing, custom `POST /api/auth/login`, manual JWT signing in `server/middleware/auth.js`.
- Add: **Cognito User Pool** for authentication; app calls Cognito via AWS Amplify SDK or `amazon-cognito-identity-js` from the frontend, or via backend using `aws-sdk`/`@aws-sdk/client-cognito-identity-provider`.

### 3.2 RBAC mapping (FR-05.5)
- Cognito **User Pool Groups** = roles (`super_admin`, `branch_manager`, `support_exec`, `vendor`, `rider`, `customer`).
- Fine-grained permissions (beyond group-level) still stored in RDS `role_permissions` table, keyed by group name — Cognito handles *authentication*, RDS still handles *fine-grained authorization*.
- Backend middleware (`server/middleware/rbac.js`) updated to: verify Cognito-issued JWT (via Cognito's public JWKS instead of self-signed secret), extract `cognito:groups` claim, then cross-check `role_permissions` table for route-level permission.

### 3.3 OTP handling
- Cognito supports SMS/email-based MFA and custom auth challenges — use **Cognito custom auth flow** or **Cognito + SNS** for OTP-based mobile signup (FR-01.1), replacing the custom OTP logic.

### 3.4 Frontend changes
- Replace `localStorage` raw JWT storage with **Amplify Auth** session handling (still uses tokens under the hood, but Amplify manages refresh automatically — this also resolves the earlier "refresh token rotation deferred" gap for free).
- `AuthContext.tsx` — replace manual `login()`/`logout()` fetches with Amplify `signIn()`/`signOut()` calls.

---

## 4. Storage & CDN

- **S3 buckets:** `product-images`, `vendor-documents`, `videos` (separate buckets or prefixes — prefixes are simpler to manage under one bucket with folder structure: `/products/`, `/vendors/docs/`, `/media/videos/`).
- **CloudFront:** distribution in front of the S3 bucket(s) for public asset delivery (product images) — private documents (vendor KYC docs) should use **signed URLs**, not public CloudFront access.
- Existing image-upload routes (`server/routes/vendor/products.js` etc.) — replace local/mock file handling with `@aws-sdk/client-s3` `PutObjectCommand`.

---

## 5. Backend Hosting: EC2

- Instance type: `t3.small` to start (Node.js Express app is lightweight)
- Deploy via: PM2 process manager or Docker container on EC2
- Reverse proxy: Nginx in front of the Node app (port 80/443 → Node's port 5001)
- SSL: AWS Certificate Manager (ACM) cert attached via an Application Load Balancer (ALB) in front of EC2, or Nginx + Let's Encrypt if skipping ALB for cost reasons
- Environment variables (`RDS connection string`, `Cognito Pool ID`, `S3 bucket names`) — managed via **AWS Systems Manager Parameter Store** or `.env` (Parameter Store recommended for security)

---

## 6. IAM — Permissions & Security

Create least-privilege IAM roles:
- **EC2 instance role:** S3 read/write (specific buckets only), RDS connect, Cognito admin actions (user management from admin panel), Parameter Store read
- **Admin/dev IAM users:** scoped console access, MFA enforced
- No hardcoded AWS keys in code — EC2 instance role + SDK default credential chain only

---

## 7. Migration Steps (Sequenced)

1. **Provision AWS resources:** RDS PostgreSQL instance, Cognito User Pool + Groups, S3 buckets, CloudFront distribution, EC2 instance, IAM roles.
2. **Schema migration:** Write Prisma schema matching Section 2.2 mapping; run initial migration against RDS.
3. **Data model rewrite:** Replace all Mongoose models/queries in `server/models/` and `server/routes/` with Prisma equivalents.
4. **Auth rewrite:** Replace `server/routes/auth.js` and `server/middleware/auth.js` with Cognito-based verification; update `server/middleware/rbac.js` for JWKS + groups.
5. **Frontend auth rewire:** Update `AuthContext.tsx` to use Amplify Auth instead of manual fetch+localStorage.
6. **File upload rewrite:** Point all image/document upload logic to S3 via SDK.
7. **Deploy backend to EC2:** Set up Nginx + PM2, configure environment via Parameter Store.
8. **Re-run verification plan** (see Section 8) against the new stack.
9. **Remove mock-data fallback flag (`USE_MOCK`)** once real endpoints are confirmed working — or keep for local dev only, pointed at a local Postgres/Cognito-sandbox setup.

---

## 8. Updated Verification Plan

### Automated
- `npm run lint`
- Backend smoke test: EC2-hosted `/api/health` returns 200
- Prisma migration dry-run passes with no schema conflicts

### Manual
- Cognito sign-up/sign-in flow works end-to-end (including OTP if configured)
- Admin login → dashboard loads with **real RDS data** (not mock)
- Admin → Vendors → approve a vendor → status persists in RDS
- Admin → RBAC → create role → Cognito group + `role_permissions` row both created
- Vendor → Products → add product → image uploads to S3, appears via CloudFront URL
- Vendor → Wallet → withdrawal request → RDS transaction row created
- RBAC: user in `support_exec` Cognito group cannot hit `/api/admin/rbac` (403 expected)
- S3 vendor documents are **not** publicly accessible without signed URL

---

## 9. Open Questions (new, from this migration)

- RDS Multi-AZ / read replicas — needed for production launch or defer to post-MVP?
- Cognito custom domain for hosted UI (branding) — or fully custom login screens via Amplify SDK (recommended, matches existing Tailwind design)?
- Backup/retention policy for RDS (automated snapshots — default 7 days, confirm with client)?
- Who owns the AWS account/billing — client's AWS account or Codtech's, with client added as IAM user?
