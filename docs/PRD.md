# Product Requirements Document (PRD)
## Multi-Vendor E-Commerce, Quick Commerce & HVAC Marketplace Platform
### v2.0 — Complete / Zero-Omission Edition

| Field | Value |
|---|---|
| Document Type | PRD (converted from Client Scope of Work — every source item verified present) |
| Client / Authorized By | Codtech IT Solutions Private Limited |
| Prepared For | Engineering / AI-agent-consumable spec |
| Project Duration | 60 days (approx. 2 months) |
| Version | 2.0 — Complete Edition (supersedes v1.0; closes all gaps found in v1.0 review) |
| Status | Draft — ready for engineering breakdown |

---

## 0. How to use this document

- Each functional area has a **Module ID** (e.g. `MOD-01`) and **Requirement IDs** (e.g. `FR-01.1`) for direct ticket/task reference.
- Every requirement includes **User Story**, **Acceptance Criteria**, and **Priority** (P0 = must-have for MVP/launch, P1 = important, P2 = nice-to-have/future).
- **Section 17 (Traceability Appendix)** maps every single bullet point from the client's original Scope of Work to the requirement ID that covers it, so nothing from the source document is lost. Where the source lacked a clear priority or detail, it is marked **[TO CONFIRM WITH CLIENT]** rather than silently dropped or invented.
- Section 12 (Data Model Hints) is a starting point for schema design, not a final schema.
- Section 13 (Tech Stack) is a **fixed constraint** unless explicitly overridden.

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

**Two fulfillment models:**
- **A. Quick Commerce (Instant Delivery):** nearby-rider fulfillment, similar to Instamart/Blinkit/Zepto.
- **B. Traditional E-Commerce:** shipped via logistics partners (Shiprocket, Blue Dart, Delhivery, DTDC, other courier providers) with real-time shipment tracking.

**Plus a dedicated vertical:**
- **C. HVAC Marketplace & Service Management:** AC sales, installation, repair/maintenance, AMC plans, HVAC projects, spare parts & accessories, commercial HVAC solutions, emergency 24/7 service booking.

---

## 2. Goals & Success Criteria

- Ship a scalable, enterprise-grade marketplace enabling businesses to sell products, manage vendors, track deliveries, onboard riders/technicians, operate multiple branches, and serve customers across instant + traditional delivery + HVAC service booking.
- Launch within the 60-day phased timeline (Section 13) with all P0 requirements complete.
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

**In scope:** Everything in Sections 5–10 below (Customer, Vendor, Delivery, Shipping, HVAC, Admin/Branch/RBAC/Service Area/Support/Notifications/Reporting, Security).

**Out of scope / client-borne costs (see Section 14):**
- Third-party service charges (payment gateway fees, SMS costs, domain, business email, Play Store fee)
- AWS hosting costs beyond the complimentary 6-month period
- iOS application (marked **Future Ready**, not part of this delivery)

---

## 5. Functional Requirements — Customer (`MOD-01`)

### FR-01.1 — Registration & Authentication (P0)
**User Story:** As a customer, I want to sign up and log in via mobile OTP, email, or social login so I can access the platform securely.
**Acceptance Criteria:**
- Sign up via Mobile Number + OTP verification
- Sign up using Email Address
- Login using Email + Password
- Forgot Password recovery flow
- Secure User Authentication (session/token-based, JWT)
- Social Login **(P2 / Optional)** — as an additional login method alongside Mobile OTP and Email/Password

### FR-01.2 — Product Browsing (P0)
- Browse Categories
- Search Products
- Filter Products
- View Product Details
- Product Reviews & Ratings
- Product Images Gallery
- Product Recommendations (P1)
- Wishlist (P1)
- Compare Products (P1)

### FR-01.3 — Shopping Cart & Checkout (P0)
- Add to Cart
- Buy Now
- Save for Later
- Apply Coupons
- Address Management
- Multiple Delivery Addresses

### FR-01.4 — Payment Gateway Integration (P0)
- UPI Payments
- Credit Cards
- Debit Cards
- Net Banking
- Wallet Payments
- Cash on Delivery (Optional / configurable per order or zone)
- EMI Options (P1)
- Gateway options: Razorpay, PhonePe Payment Gateway, PayU, Cashfree — **[TO CONFIRM WITH CLIENT: default/primary gateway priority order]**

### FR-01.5 — Order Management (P0)
- Place Orders
- Track Orders in Real-Time
- View Order History
- Download Invoices
- Cancel Orders
- Request Returns & Refunds

### FR-01.6 — Quick Commerce Order Flow (P0)
- Automatic Rider Assignment
- Nearest Rider Allocation
- Live Order Tracking
- Real-Time Delivery Updates
- Instant Delivery Workflow (distinct SLA/status machine from traditional orders)

### FR-01.7 — Tracking (Cross-cutting, HVAC + E-Commerce) (P0)
- Product Delivery Tracking
- Service Tracking (HVAC)
- Quick Commerce Tracking
- Delivery Timelines display to customer

### FR-01.8 — Service Booking (HVAC-specific) (P0)
- Installation Booking
- Repair Requests
- AMC Booking
- Appointment Rescheduling
- Technician Tracking (live location during service visit)

### FR-01.9 — Support & Engagement (P1)
- Live Chat
- WhatsApp Integration
- Ticket Generation
- Ratings & Reviews
- Loyalty Rewards Program

---

## 6. Functional Requirements — Multi-Vendor Marketplace (`MOD-02`)

### FR-02.1 — Vendor Registration (P0)
- Vendor Application Form including: Business Name, Contact Information, GST Details, Address Verification, Document Upload
- Business Verification
- Profile Management
- Admin approval workflow (approve/reject/suspend)

### FR-02.2 — Vendor Product & Catalog Management (P0)
- Add Products
- Edit Products
- Delete Products
- Mark Products Out of Stock
- Manage Inventory
- Upload Product Images
- Manage Product Pricing
- Manage Product Variants

### FR-02.3 — Vendor Inventory Management (P0)
- Stock Control
- Low Stock Alerts
- Inventory Reports
- Product Availability status

### FR-02.4 — Vendor Order Management (P0)
- View New Orders
- Process Orders
- Pack Orders
- Update Order Status
- Generate Reports
- Manage Invoices
- Manage Returns
- Fulfillment Updates

### FR-02.5 — Vendor Sales Analytics (P1)
- Daily Sales Reports
- Weekly Reports
- Monthly Reports
- Revenue Reports
- Product Performance Reports

### FR-02.6 — Vendor Wallet (P0)
- Earnings Dashboard
- Commission Deductions
- Withdrawal Requests
- Transaction History
- Settlement Reports
- Pending Payments view
- Commission Tracking

### FR-02.7 — Vendor-side HVAC Technician Management (P0)
- Assign Technicians
- Service Tracking
- Performance Monitoring
- Visit Scheduling

---

## 7. Functional Requirements — Delivery & Shipping (`MOD-03`)

### FR-03.1 — Rider Registration & Approval (P0)
- Submit Applications
- Upload Identity Documents
- Upload Vehicle Information
- Submit Bank Details
- Admin: Verify Applications, Approve Riders, Reject Riders, Suspend Riders

### FR-03.2 — Rider Dashboard (P0)
- View Assigned Orders
- Accept or Reject Orders
- Navigate Using Maps
- Update Delivery Status
- Track Earnings

### FR-03.3 — Rider Wallet (P0)
- Virtual Wallet Balance
- Commission Credits
- Withdrawal Requests
- Transaction Reports
- Settlement Management

### FR-03.4 — Traditional Shipping / Courier Integration (P0)
- Integrations: Shiprocket, Blue Dart, Delhivery, DTDC, Other Courier Partners
- Shipment Creation
- AWB Generation
- Shipping Labels
- Courier Selection
- Real-Time Tracking
- Delivery Notifications

### FR-03.5 — Warehouse & Packaging Tracking (P0)
- Order Packing Status
- Ready to Ship Status
- Shipped Status
- In Transit Status
- Delivered Status

---

## 8. Functional Requirements — HVAC Marketplace Module (`MOD-04`)

### FR-04.1 — HVAC Catalog & Categories (P0)
- AC Categories: Split AC, Window AC, Cassette AC, Ductable AC, Tower AC, Commercial AC Systems
- Spare Parts & Accessories catalog: Compressors, Motors, Capacitors, Thermostats, Remote Controls, Copper Pipes, Filters, Consumables
- Commercial HVAC Solutions

### FR-04.2 — HVAC Services (P0)
- New Installation
- Reinstallation
- Site Inspection
- Installation Scheduling
- Gas Refilling
- Compressor Repairs
- Cooling Issue Resolution
- Electrical Repairs
- Breakdown Support

### FR-04.3 — AMC (Annual Maintenance Contract) Management (P0)
- Residential AMC Plans
- Commercial AMC Plans
- Preventive Maintenance Scheduling
- Renewal Management
- Service History Tracking
- AMC Subscriptions Reporting

### FR-04.4 — HVAC Projects (P1)
- Commercial Installations
- Industrial Projects
- Design & Consultation
- Site Surveys
- Estimation
- Quotations
- Project Tracking

### FR-04.5 — Emergency Service (P0)
- 24/7 Emergency Requests
- Priority Technician Allocation
- Emergency Tracking
- Instant Notifications

### FR-04.6 — HVAC-specific Reporting (P1)
- Product Sales reports
- HVAC Services reports
- AMC Subscriptions reports

---

## 9. Functional Requirements — Admin, Branch, RBAC, Support, Notifications, Reporting (`MOD-05`)

### FR-05.1 — Admin Dashboard Overview (P0)
- Total Users
- Total Vendors
- Total Riders
- Total Orders
- Revenue Reports
- Pending Approvals
- Active Deliveries

### FR-05.2 — User Management (P0)
- View Users
- Suspend Users
- Block Accounts
- Manage Customer Issues

### FR-05.3 — Vendor Management (P0)
- Approve Vendors
- Reject Vendors
- Suspend Vendors
- Monitor Sales Activity
- Quality Monitoring of vendor listings/performance

### FR-05.4 — Rider Management (P0)
- Approve Riders
- Track Deliveries
- Monitor Rider Performance
- Manage Rider Settlements

### FR-05.5 — Technician Approval & Marketplace Control (P0)
- Technician Approval workflow (parallel to Vendor/Rider approval)
- Marketplace Control (category/listing gatekeeping)
- Account Suspension across vendor/technician/rider roles
- Quality Monitoring

### FR-05.6 — Product & Category Management (Admin) (P0)
- Create Products
- Edit Products
- Delete Products
- Manage Inventory
- Create Categories
- Create Subcategories
- Product Listings control (HVAC + general marketplace)

### FR-05.7 — Order Management (Admin) (P0)
- Monitor All Orders
- Track Deliveries
- Process Refunds
- Resolve Disputes

### FR-05.8 — Branch Management System (P0)
- Admin can create multiple branches
- Each branch has: Branch Manager, Support Team, Assigned Service Areas, Local Delivery Operations
- Branch-wise reporting: Orders, Sales, Riders, Vendors, Customers

### FR-05.9 — Role-Based Access Control / RBAC (P0)
- Admin creates team members with custom permissions
- Roles include (extensible): **Super Admin**, Branch Manager, Support Executive, Vendor, Rider, Technician
- *(Note: source document's role list was truncated/garbled in the original scan — only "Super Admin" was legible as an explicit named role; all other roles inferred from context across the document and flagged below in Section 17 for client confirmation.)* **[TO CONFIRM WITH CLIENT: complete authoritative role list]**

### FR-05.10 — Service Area & Pincode Management (P0)
- Add Serviceable Pincodes
- Disable Specific Locations
- Control Delivery Zones
- Configure Branch Service Areas
- Outside-serviceable-area flow: Lead Collection Form, Demand Registration, Service Request Submission
- Reports available to Admin for future expansion decisions

### FR-05.11 — Support Team Dashboard (P0)
- Manage Customer Tickets
- Handle Complaints
- Process Refund Requests
- Track Deliveries
- Communicate with Users
- Ticket Handling, Staff Assignment, Resolution Tracking, Escalation Management

### FR-05.12 — Notification System (P0)
- Channels: SMS, Email, Push Notifications, WhatsApp (Optional)
- Events: Order Updates, Delivery Updates, Payment Confirmations, Vendor Notifications, Rider Notifications

### FR-05.13 — Reporting & Analytics (P1)
- Sales Reports
- Vendor Reports
- Rider Reports
- Customer Reports
- Revenue Reports
- Branch Performance Reports
- Order Analytics
- Inventory Analytics
- Product Sales, HVAC Services, AMC Subscriptions, Vendor Performance, Rider Performance, Customer Analytics (HVAC-specific reporting overlap with FR-04.6)

### FR-05.14 — Offers, Coupons & Commission Management (P1)
- Discount Campaigns
- Cashback Programs
- Promotions
- Commission Management for Vendors, Riders, and Service Providers — **[TO CONFIRM WITH CLIENT: exact commission % structure — not specified in source]**

---

## 10. Non-Functional / Security Requirements (`MOD-06`)

| Requirement | Detail (source item) |
|---|---|
| Transport Security | SSL Encryption on all endpoints |
| Auth | Secure Authentication, JWT Authentication, OTP Verification, Password Encryption |
| API Security | API Security, rate limiting, input validation, RBAC-enforced route guards |
| Data | Data Backup System, encrypted storage of sensitive fields |
| Access Control | Role-Based Security across all portals, Role-Based Access Control (RBAC) |

**Login Methods (explicit list from source):**
- Mobile OTP Login
- Email Login
- Password Authentication
- Social Login (Optional)

---

## 11. Frontend / Platform Quality Requirements

*(These were listed under the client's "Website Technology Stack → Frontend Features" and are functional/quality requirements in their own right, not just tech-stack line items — captured here explicitly so nothing is lost.)*

- Responsive User Interface
- Mobile-Friendly Design
- Progressive Web Experience (PWA-style behavior)
- Dynamic Components
- SEO-Friendly Architecture
- Cross-Browser Compatibility
- Real-Time Data Rendering

**Mobile App Features (explicit list from source):**
- Native Performance
- Push Notifications
- GPS Location Tracking
- Live Order Tracking
- Real-Time Updates
- Secure Authentication
- Service Booking Management
- Vendor Management (mobile-accessible)
- Rider Management (mobile-accessible)

**Real-Time Features (explicit list from source, technology: WebSockets):**
- Live Order Tracking
- Rider Tracking
- Technician Tracking
- Instant Notifications
- Live Chat Support
- Real-Time Status Updates

**Database Features (explicit list from source, technology: MongoDB/NoSQL):**
- NoSQL Architecture
- High Scalability
- Flexible Data Modeling
- Fast Query Performance
- Secure Data Storage
- Real-Time Data Synchronization

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
- `Wishlist` / `CompareList` (customer product-browsing entities)

---

## 13. Technology Stack (fixed — treat as constraints)

**Architecture:** MERN stack + React Native (mobile) + AWS Cloud Infrastructure

| Layer | Technology |
|---|---|
| Frontend (Web) | HTML5, CSS3, JavaScript (ES6+), React.js |
| Backend | Node.js, Express.js — REST API Development, Authentication & Authorization, Business Logic Management, Payment Gateway Integrations, Order Processing System, Vendor Management, Rider Management, HVAC Service Management, Real-Time Tracking APIs |
| Database | MongoDB (NoSQL) — MongoDB Atlas on AWS |
| Mobile | React Native — Android now, iOS Application (Future Ready) |
| Real-time | WebSockets (Socket.IO) |
| Cloud Hosting | AWS (Amazon Web Services) |
| — Compute | Amazon EC2 |
| — Storage | Amazon S3 |
| — Database Hosting | MongoDB Atlas on AWS |
| — CDN | Amazon CloudFront |
| — Security | AWS SSL Certificates, AWS WAF (Web Application Firewall) |
| — Monitoring | Amazon CloudWatch |
| — Backup & Recovery | AWS Backup Services |
| Auth | JWT Authentication, OTP Verification, Password Encryption, SSL Security, API Security, Role-Based Access Control (RBAC) |
| Payments | Razorpay, PhonePe Payment Gateway, PayU, Cashfree |
| Shipping | Shiprocket, Blue Dart, Delhivery, DTDC |
| Communication | WhatsApp API, SMS Gateway, Email Services |
| Maps/Location | Google Maps API, GPS Tracking Services |
| Dev Tools — Version Control | Git, GitHub |
| Dev Tools — API Testing | Postman |
| Dev Tools — Project Management | Jira, Trello |
| Dev Tools — Code Editor | Visual Studio Code |

---

## 14. Phased Delivery Plan & Milestones

**Total duration:** 60 days (~2 months)

| Phase | Scope | Timeline | Payment |
|---|---|---|---|
| **Phase 1** | UI/UX Design for Customer, Vendor, Rider & Admin Panels; Mobile Responsive User Interface; User Experience Optimization | 5–10 days | ₹5,000 (Initial Advance) |
| **Phase 2** | Android Application Setup; AWS Server Configuration; User Authentication System; Google Maps Integration; Payment Gateway Integration; Database Configuration | 10–15 days | ₹10,000 |
| **Phase 3** | Backend API Development; Frontend & Backend Integration; Order Management System; Real-Time Tracking Features; Security Configuration; AWS Deployment; Live Website Launch | 15–30 days | ₹15,000 |
| **Phase 4** | Application Testing; Bug Fixing & Performance Optimization; User Acceptance Testing (UAT); Android Play Store Submission; Final Production Deployment; Source Code & Project Handover | 30–60 days | Final Milestone (as per agreement) |

**Payment Summary**

| Milestone | Amount |
|---|---|
| Initial Advance | ₹5,000 |
| Development Milestone 2 | ₹10,000 |
| Development Milestone 3 | ₹15,000 |
| Final Milestone | As Per Agreement |

---

## 15. Important Business Notes / Constraints (verbatim scope, as agreed)

1. Third-party charges are **not** included in the project cost.
2. Payment Gateway fees, Domain Registration, Business Emails, AWS charges after the complimentary period, SMS services, and Play Store subscription fees will be borne by the client.
3. AWS server hosting will be provided free for the first 6 months. Thereafter, charges will be applicable on a pay-as-you-use basis.
4. The agreement covers **one Mobile Application and one Website** combining both E-Commerce and Quick Commerce functionalities.
5. Technical support and maintenance assistance will be provided free of charge for **1 year** after successful deployment.
6. Authorized by: **Codtech IT Solutions Private Limited**.

---

## 16. Final Deliverables Checklist

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

**Expected Outcome:** A scalable, enterprise-grade Multi-Vendor E-Commerce, Quick Commerce, HVAC Product Sales, HVAC Service Booking, AMC Management and Delivery Management ecosystem, enabling businesses to sell products, manage vendors, track deliveries, onboard riders, operate multiple branches, and provide seamless customer experiences through both instant and traditional delivery models.

---

## 17. Traceability Appendix — Source-to-Requirement Map

This table exists specifically to guarantee zero omission. Every numbered section of the client's original Scope of Work is mapped to where it lives in this PRD.

| Original SOW Section | Title | Covered In |
|---|---|---|
| 1 | Project Overview | §1 |
| 2 | Customer Features (Registration, Browsing, Cart, Payment, Orders, Quick Commerce) | §5 (FR-01.1–01.6) |
| 3 | Multi-Vendor Marketplace System (Registration, Dashboard, Orders, Analytics, Wallet) | §6 (FR-02.1–02.6) |
| 4 | Quick Commerce Delivery Management (Rider Registration, Approval, Dashboard, Wallet) | §7 (FR-03.1–03.3) |
| 5 | Traditional Shipping Management (Courier Integration, Shipping Features, Warehouse Tracking) | §7 (FR-03.4–03.5) |
| 6 | Admin Management Portal (Dashboard, User/Vendor/Rider/Product/Order Management) | §9 (FR-05.1–05.7) |
| 7 | Branch Management System | §9 (FR-05.8) |
| 8 | Role-Based Access Control (RBAC) | §9 (FR-05.9) |
| 9 | Service Area & Pincode Management | §9 (FR-05.10) |
| 10 | Support Team Dashboard | §9 (FR-05.11) |
| 11 | Notification System | §9 (FR-05.12) |
| 12 | Reporting & Analytics | §9 (FR-05.13) |
| 13 | Security Features | §10 |
| 14 | Deliverables | §16 |
| 15 | Expected Outcome | §16 |
| 16 | HVAC Marketplace & Service Management Module | §8 (FR-04.1–04.5) |
| 17 | Customer Features (HVAC-extended: search, filters, recommendations, wishlist, compare, tracking, service booking, support, loyalty) | §5 (FR-01.2, 01.4, 01.7, 01.8, 01.9) |
| 18 | Vendor Features (HVAC-extended: registration, product/inventory/order mgmt, technician mgmt, earnings) | §6 (FR-02.1–02.7) |
| 19 | Advanced Admin Panel Features (Category/Marketplace Control, Approval, Commission, Offers, Reports, Support Mgmt) | §9 (FR-05.5, 05.13, 05.14) |
| Final Deliverables (post §19) | Complete deliverables list | §16 |
| Technology Stack — Project Architecture | MERN + React Native + AWS | §13 |
| Technology Stack — Website (Frontend) | HTML5/CSS3/JS/React.js + Frontend Features | §13, §11 |
| Technology Stack — Backend | Node.js/Express.js + Backend Features | §13 |
| Technology Database | MongoDB/NoSQL + DB Features | §13, §11 |
| Mobile Application Technology Stack | React Native, Android/iOS-future, Mobile App Features | §13, §11 |
| Cloud Infrastructure (AWS: Compute/Storage/DB/CDN/Security/Monitoring/Backup) | §13 |
| Authentication & Security (Technologies + Login Methods) | §10 |
| Payment Gateway Integration | §5 (FR-01.4), §13 |
| Real-Time Features (WebSockets + Feature list) | §13, §11 |
| Third-Party Integrations (Shipping/Communication/Maps) | §13 |
| Development Tools | §13 |
| Project Timeline & Payment Milestones | §14 |
| Important Notes (1–5) | §15 |
| Payment Summary | §14 |
| Authorized By | §0 header, §15 |

**Explicitly verified zero-drop items** (previously at risk of being summarized away — now individually present in this v2.0 edition):
Social Login · Progressive Web Experience · Dynamic Components · Real-Time Data Rendering · Low Stock Alerts · Inventory Reports · Product Availability status · Delivery Timelines · Quality Monitoring · Marketplace Control · Mobile App Features list (Native Performance, GPS Tracking, etc.) · Real-Time Features list (Rider/Technician Tracking, Live Chat Support, etc.) · MongoDB/Database Features list · Product Variants · Business Verification · Profile Management (vendor) · Ticket Handling/Staff Assignment/Resolution/Escalation Management (support) · Pending Payments / Commission Tracking (vendor earnings).

---

## 18. Open Questions / Assumptions (flag to client before build)

- Default payment gateway priority order across Razorpay/PhonePe/PayU/Cashfree — needs confirmation.
- Whether COD is enabled per-zone or globally.
- Commission % structure for vendors, riders, and technicians — not specified in source doc, needs client input.
- Whether HVAC technicians are vendor-employed or platform-onboarded independently (affects `Technician` schema ownership).
- The complete RBAC role list beyond "Super Admin" — the source document's role list appeared truncated in the original scan; needs the client's authoritative list.
- iOS timeline — currently "future ready," no committed date in source.

*(Note: this section contains PM-added inferences for engineering planning purposes only — everything above the line in Sections 1–17 is sourced directly and completely from the client's original Scope of Work document, with no external assumptions folded into the requirements themselves.)*