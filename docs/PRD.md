# Product Requirements Document (PRD)
## Multi-Vendor E-Commerce, Quick Commerce & HVAC Marketplace Platform

| Field | Value |
|---|---|
| Document Type | PRD (converted from Client Scope of Work) |
| Client / Authorized By | Codtech IT Solutions Private Limited |
| Prepared For | Antigravity IDE — AI-agent-consumable spec |
| Project Duration | 60 days (approx. 2 months) |
| Version | 1.0 |
| Status | Draft — ready for engineering breakdown |

---

## 0. How to use this document (for the AI agent)

- Each functional area has a **Module ID** (e.g. `MOD-01`) and a set of **Requirement IDs** (e.g. `FR-01.1`) so tasks/tickets can reference them directly.
- Every requirement includes: **User Story**, **Acceptance Criteria**, and **Priority** (P0 = must-have for MVP/launch, P1 = important, P2 = nice-to-have/future).
- Treat Section 8 (Data Model Hints) as a starting point for schema design, not a final schema — validate against actual business rules before migration generation.
- Treat Section 10 (Tech Stack) as **fixed constraints** unless the user explicitly overrides them in a workspace/global rule.

---

## 1. Project Overview

**Objective:** Build a comprehensive Multi-Vendor E-Commerce + Quick Commerce + HVAC Service Marketplace platform, delivered as **one Android application** and **one responsive website**, combining E-Commerce and Quick Commerce functionality, plus a dedicated HVAC vertical (sales, installation, AMC, emergency service).

**System components (apps/portals to be built):**
1. Customer Mobile Application (Android, React Native)
2. Customer Web Application (responsive, React.js)
3. Admin Management Portal (Super Admin Panel)
4. Vendor Dashboard
5. Delivery Rider Application/Panel
6. Technician Management Portal (HVAC)
7. Support Team Dashboard
8. Branch Management Portal

**Two fulfillment models supported:**
- **A. Quick Commerce (Instant Delivery):** nearby-rider fulfillment, similar to Instamart/Blinkit/Zepto.
- **B. Traditional E-Commerce:** shipped via logistics partners (Shiprocket, Blue Dart, Delhivery, DTDC, others) with real-time tracking.

**Plus a dedicated vertical:**
- **C. HVAC Marketplace & Service Management:** AC sales, installation, repair/maintenance, AMC plans, HVAC projects, spare parts, emergency 24/7 service.

---

## 2. Goals & Success Criteria

- Ship a scalable, enterprise-grade marketplace enabling businesses to sell products, manage vendors, track deliveries, onboard riders/technicians, operate multiple branches, and serve customers across instant + traditional delivery + HVAC service booking.
- Launch within the 60-day phased timeline (Section 12) with all P0 requirements complete.
- All 4 phases pass UAT before production deployment and Play Store submission.

---

## 3. User Personas / Roles

| Role | Primary Goals |
|---|---|
| **Customer** | Browse/search products & services, order, track, pay, request returns, book HVAC services |
| **Vendor** | List/manage products, fulfill orders, view earnings, manage technicians (HVAC vendors) |
| **Delivery Rider** | Accept/reject orders, navigate, update delivery status, track earnings |
| **Technician (HVAC)** | Receive service assignments, update visit/service status, track performance |
| **Support Executive** | Manage tickets, complaints, refunds, live chat |
| **Branch Manager** | Oversee branch-level orders, sales, riders, vendors, customers |
| **Super Admin** | Full platform control — users, vendors, riders, products, branches, RBAC, reporting |

---

## 4. Scope Boundaries

**In scope:** Everything listed in Sections 5–9 below (Customer, Vendor, Delivery, Shipping, Admin, Branch, RBAC, Service Area, Support, Notifications, Reporting, HVAC module, Security).

**Out of scope / client-borne costs (see Section 13, Important Notes):**
- Third-party service charges (payment gateway fees, SMS costs, domain, business email, Play Store fee)
- AWS hosting costs beyond the complimentary 6-month period
- iOS application (marked **Future Ready**, not part of this delivery)

---

## 5. Functional Requirements — Customer (`MOD-01`)

### FR-01.1 — Registration & Authentication (P0)
**User Story:** As a customer, I want to sign up and log in via mobile OTP or email so I can access the platform securely.
**Acceptance Criteria:**
- Sign up via Mobile Number + OTP verification
- Sign up via Email Address
- Login via Email + Password
- Forgot Password recovery flow
- Secure session/token-based authentication (JWT)

### FR-01.2 — Product Browsing (P0)
- Browse categories, search products, apply filters
- View product detail page with image gallery
- View reviews & ratings
- Product recommendations, wishlist, compare products (P1)

### FR-01.3 — Shopping Cart & Checkout (P0)
- Add to Cart, Buy Now, Save for Later
- Apply coupons
- Address management with multiple delivery addresses

### FR-01.4 — Payment Gateway Integration (P0)
- UPI, Credit Card, Debit Card, Net Banking, Wallets
- EMI options (P1)
- Cash on Delivery (optional, configurable per order/zone)
- Gateway options: Razorpay, PhonePe, PayU, Cashfree (Razorpay primary per client's existing NGO/other project usage pattern — confirm default with client)

### FR-01.5 — Order Management (P0)
- Place orders, view real-time tracking, view order history
- Download invoices
- Cancel orders; request returns & refunds

### FR-01.6 — Quick Commerce Order Flow (P0)
- Automatic nearest-rider assignment
- Live order tracking, real-time delivery updates
- Instant delivery workflow (distinct SLA/status machine from traditional orders)

### FR-01.7 — Service Booking (HVAC-specific) (P0)
- Installation booking, repair requests, AMC booking
- Appointment rescheduling
- Technician tracking (live location during service visit)

### FR-01.8 — Support & Engagement (P1)
- Live Chat, WhatsApp integration
- Ticket generation
- Loyalty & Rewards program

---

## 6. Functional Requirements — Multi-Vendor Marketplace (`MOD-02`)

### FR-02.1 — Vendor Registration (P0)
- Application form: Business Name, Contact Info, GST Details, Address Verification, Document Upload
- Admin approval workflow (approve/reject/suspend)

### FR-02.2 — Vendor Dashboard (P0)
- Add/Edit/Delete products, mark out-of-stock, manage inventory
- Upload product images, manage pricing & variants

### FR-02.3 — Vendor Order Management (P0)
- View new orders, process, pack, update status, generate reports

### FR-02.4 — Vendor Sales Analytics (P1)
- Daily/Weekly/Monthly sales, revenue, product-performance reports

### FR-02.5 — Vendor Wallet (P0)
- Earnings dashboard, commission deductions, withdrawal requests
- Transaction history, settlement reports

---

## 7. Functional Requirements — Delivery & Shipping (`MOD-03`)

### FR-03.1 — Rider Registration & Approval (P0)
- Submit application, identity docs, vehicle info, bank details
- Admin: verify, approve, reject, suspend riders

### FR-03.2 — Rider Dashboard (P0)
- View/accept/reject assigned orders
- Map navigation, delivery status updates, earnings tracking

### FR-03.3 — Rider Wallet (P0)
- Virtual wallet balance, commission credits, withdrawal requests
- Transaction reports, settlement management

### FR-03.4 — Traditional Shipping / Courier Integration (P0)
- Integrate: Shiprocket, Blue Dart, Delhivery, DTDC (+ extensible for others)
- Shipment creation, AWB generation, shipping labels, courier selection
- Real-time tracking, delivery notifications
- Warehouse status pipeline: Packing → Ready to Ship → Shipped → In Transit → Delivered

---

## 8. Functional Requirements — HVAC Marketplace Module (`MOD-04`)

### FR-04.1 — HVAC Catalog & Categories (P0)
- AC categories: Split, Window, Cassette, Ductable, Tower, Commercial systems
- Spare parts catalog: Compressors, Motors, Capacitors, Thermostats, Remote Controls, Copper Pipes, Filters, Consumables

### FR-04.2 — HVAC Services (P0)
- New installation, reinstallation, site inspection, installation scheduling
- Gas refilling, compressor repair, cooling issue resolution, electrical repairs, breakdown support

### FR-04.3 — AMC (Annual Maintenance Contract) Management (P0)
- Residential & Commercial AMC plans
- Preventive maintenance scheduling, renewal management, service history tracking

### FR-04.4 — HVAC Projects (P1)
- Commercial/industrial installation projects
- Design & consultation, site surveys, estimation, quotations, project tracking

### FR-04.5 — Emergency Service (P0)
- 24/7 emergency request intake
- Priority technician allocation, emergency tracking, instant notifications

### FR-04.6 — Vendor-side HVAC Technician Management (P0)
- Assign technicians to jobs, track service visits, monitor performance, manage visit scheduling

---

## 9. Functional Requirements — Admin, Branch, RBAC, Support (`MOD-05`)

### FR-05.1 — Admin Dashboard (P0)
- Totals: Users, Vendors, Riders, Orders; Revenue reports; Pending approvals; Active deliveries

### FR-05.2 — User / Vendor / Rider Management (P0)
- View, suspend, block users; manage customer issues
- Approve/reject/suspend vendors; monitor sales activity
- Approve riders; track deliveries; monitor rider performance; manage settlements

### FR-05.3 — Product & Order Management (Admin) (P0)
- Create/edit/delete products, manage inventory, categories & subcategories
- Monitor all orders, track deliveries, process refunds, resolve disputes

### FR-05.4 — Branch Management System (P0)
- Admin creates multiple branches; each branch has: Branch Manager, Support Team, assigned Service Areas, local delivery operations
- Branch-wise reporting: Orders, Sales, Riders, Vendors, Customers

### FR-05.5 — Role-Based Access Control / RBAC (P0)
- Admin creates team members with custom permissions
- Roles include (extensible): **Super Admin**, Branch Manager, Support Executive, Vendor, Rider, Technician

### FR-05.6 — Service Area & Pincode Management (P0)
- Add serviceable pincodes, disable specific locations, control delivery zones, configure branch service areas
- Outside-serviceable-area flow: Lead Collection Form, Demand Registration, Service Request Submission
- Reports for future expansion decisions

### FR-05.7 — Support Team Dashboard (P0)
- Manage customer tickets, handle complaints, process refund requests, track deliveries, communicate with users

### FR-05.8 — Notification System (P0)
- Channels: SMS, Email, Push Notifications, WhatsApp (optional)
- Events: Order updates, Delivery updates, Payment confirmations, Vendor notifications, Rider notifications

### FR-05.9 — Reporting & Analytics (P1)
- Sales, Vendor, Rider, Customer, Revenue, Branch Performance, Order Analytics, Inventory Analytics reports
- HVAC-specific: Product Sales, HVAC Services, AMC Subscriptions reports

### FR-05.10 — Offers & Commission Management (P1)
- Discount campaigns, cashback programs, promotions
- Commission management for vendors, riders, and service providers

---

## 10. Non-Functional / Security Requirements (`MOD-06`)

| Requirement | Detail |
|---|---|
| Transport Security | SSL/TLS encryption on all endpoints |
| Auth | JWT-based auth, OTP verification, password encryption (bcrypt/argon2) |
| API Security | Rate limiting, input validation, RBAC-enforced route guards |
| Data | Encrypted storage of sensitive fields, automated backup system |
| Access Control | Role-based security across all portals |

---

## 11. Technology Stack (fixed — treat as constraints)

**Architecture:** MERN stack + React Native (mobile) + AWS Cloud Infrastructure

| Layer | Technology |
|---|---|
| Frontend (Web) | HTML5, CSS3, JavaScript (ES6+), React.js — responsive, SEO-friendly, cross-browser |
| Backend | Node.js, Express.js — REST API |
| Database | MongoDB (NoSQL) — MongoDB Atlas on AWS |
| Mobile | React Native — Android now, iOS future-ready |
| Real-time | Socket.IO / WebSockets (order tracking, rider/technician tracking, live chat, status updates) |
| Cloud Hosting | AWS — EC2 (compute), S3 (storage), CloudFront (CDN), WAF + SSL (security), CloudWatch (monitoring), AWS Backup |
| Auth | JWT, OTP, RBAC |
| Payments | Razorpay, PhonePe, PayU, Cashfree (multi-gateway support) |
| Shipping | Shiprocket, Blue Dart, Delhivery, DTDC APIs |
| Communication | WhatsApp API, SMS Gateway, Email service |
| Maps/Location | Google Maps API, GPS tracking services |
| Dev Tools | Git/GitHub, Postman, Jira/Trello, VS Code (or Antigravity IDE) |

> Note for the agent: this matches Ashok's existing freelance stack conventions (Next.js/Node/MongoDB projects) — align folder structure, auth pattern (JWT + refresh token rotation as used in prior projects), and Razorpay integration approach with his established patterns unless the client's spec conflicts.

---

## 12. Data Model Hints (starting point — validate before finalizing schema)

Core entities to model (Mongoose/MongoDB collections):

- `User` (customer/vendor/rider/technician/admin/support — role field or separate collections + RBAC join)
- `Vendor` (business info, GST, documents, approval status, wallet)
- `Product` (vendor ref, category, variants, pricing, stock, images)
- `Category` / `Subcategory` (supports both general e-commerce and HVAC-specific categories)
- `Order` (type: quick-commerce | traditional | hvac-service; status machine per type; items, address, payment ref)
- `Cart`
- `Payment` (gateway, method, status, linked order)
- `Rider` (KYC docs, vehicle info, bank details, wallet, status)
- `Technician` (HVAC-specific — linked to vendor, skills, assigned jobs)
- `AMCContract` (customer, plan type, renewal date, service history)
- `ServiceRequest` (HVAC installation/repair/emergency — priority, technician assignment, tracking)
- `Shipment` (courier partner, AWB, status pipeline)
- `Branch` (manager, service areas, assigned staff)
- `Role` / `Permission` (RBAC)
- `ServiceArea` / `Pincode` (serviceable zones, lead capture for unserviced areas)
- `Ticket` (support)
- `Notification` (channel, event type, recipient, status)
- `Coupon` / `Commission` (promotions and commission rules)
- `Review` / `Rating`

---

## 13. Phased Delivery Plan & Milestones

**Total duration:** 60 days (~2 months)

| Phase | Scope | Timeline | Payment |
|---|---|---|---|
| **Phase 1** | UI/UX design for Customer, Vendor, Rider & Admin panels; mobile-responsive UI; UX optimization | 5–10 days | ₹5,000 (initial advance) |
| **Phase 2** | Mobile app setup, AWS configuration, Google Maps integration, Payment Gateway integration, user auth, database config | 10–15 days | ₹10,000 |
| **Phase 3** | Backend API development, frontend-backend integration, order management system, real-time tracking, security config, AWS deployment, live website launch | 15–30 days | ₹15,000 |
| **Phase 4** | Application testing, bug fixing & performance optimization, UAT, Play Store submission, final production deployment, source code & project handover | 30–60 days | Final milestone (as per agreement) |

**Payment Summary**

| Milestone | Amount |
|---|---|
| Initial Advance | ₹5,000 |
| Development Milestone 2 | ₹10,000 |
| Development Milestone 3 | ₹15,000 |
| Final Milestone | As per agreement |

---

## 14. Important Business Notes / Constraints

1. Third-party charges are **not** included in the project cost.
2. Payment gateway fees, domain registration, business email, AWS charges beyond the free period, SMS services, and Play Store subscription fees are **client-borne**.
3. AWS server hosting is free for the **first 6 months**; pay-as-you-use thereafter.
4. Agreement covers **one Mobile Application and one Website**, combining both E-Commerce and Quick Commerce functionality.
5. **1 year of free technical support & maintenance** after successful deployment.
6. Authorized by: **Codtech IT Solutions Private Limited**.

---

## 15. Final Deliverables Checklist

- [ ] Customer Android Application
- [ ] Customer Responsive Website
- [ ] Multi-Vendor Marketplace System
- [ ] HVAC Service Management Module
- [ ] Quick Commerce Delivery System
- [ ] Traditional E-Commerce Shipping System
- [ ] Vendor Dashboard
- [ ] Delivery Rider Application
- [ ] Technician Management Portal
- [ ] Support Team Dashboard
- [ ] Branch Management System
- [ ] Super Admin Panel
- [ ] Payment Gateway Integration
- [ ] Courier Partner Integration
- [ ] SMS, Email & Push Notification System
- [ ] Real-Time Tracking System
- [ ] Loyalty & Rewards Management System
- [ ] AMC Management Module
- [ ] Emergency HVAC Service Booking System

**Expected Outcome:** A scalable, enterprise-grade Multi-Vendor E-Commerce + Quick Commerce + HVAC Product Sales + HVAC Service Booking + AMC Management + Delivery Management ecosystem.

---

## 16. Open Questions / Assumptions (flag to client before build)

- Default payment gateway priority order across Razorpay/PhonePe/PayU/Cashfree — needs confirmation.
- Whether COD is enabled per-zone or globally.
- Commission % structure for vendors, riders, and technicians — not specified in source doc, needs client input.
- Whether HVAC technicians are vendor-employed or platform-onboarded independently (affects `Technician` schema ownership).
- iOS timeline — currently "future ready," no committed date.