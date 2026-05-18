# Backend Platform Features & Logic

This document comprehensively outlines all the features running on the JobsinApp backend platform and explains the underlying business logic, storage paradigms, and functionality architectures.

## 1. Platform Features Overview
The core backend infrastructure comprises the following primary features:
- **Authentication & Multi-Role User Management:** Handled natively via JWT, managing multiple user modalities (`JobSeeker`, `Employer`, `Admin`).
- **Job Matching & Filtering Engine:** Uses Geospatial indexing algorithms and strict data types to query exact matches.
- **DeepSeek AI Integration:** Powering automated salary estimates, category analysis, and recruitment chat capabilities.
- **Automated Alerts Delivery:** Push and email notifications to keep job seekers and employers synced on job matches.
- **Subscription & Stripe Payment Gateways:** Automated tracking of platform tiers (free and paid packages).
- **Communication Module:** Supporting appointments, live chat, and direct messaging between employers and seekers.

## 2. In-Depth Logic & Workflows

### A. Job Matching Engine
**How it works:**
The job matching logic skips rudimentary string-matching in favor of complex MongoDB Aggregation & Filtering.
1. **Location Proximity Logic**: The database uses `$geoWithin` spherical coordinates. When a job seeker searches for jobs within a specific radius, the backend utilizes the Haversine formula internally, projecting matches occurring strictly inside the bounding radius in Kilometers.
2. **Criteria Overlaps**: Filtering occurs strictly across specific data vertices: `category`, `subCategory`, and a numerical threshold for `salaryAmount` (`$gte`).

### B. Alerts & Notifications
**How they work:**
- **Job Alerts / JobSeeker Matches**: Notification systems use event-driven loops attached to Redis cache states. Whenever a new job matches the seeker's `experience` and `category` profile, a notification payload is structured.
- **Trigger Frequency**: Profiles contain a `NotificationSettings` sub-schema identifying `repeat` mechanisms (e.g., Daily). Cron jobs or trigger functions iterate over user preferences evaluating `lastSentAt` timestamps to batch-dispatch notifications efficiently via NodeMailer (Emails) or specific push mechanisms.

### C. Subscription Facilities & Free-Tier Limitations
**How it works:**
The platform relies on a continuous integration with Stripe Webhooks (`stripeEvent` and `invoice` modules) to auto-transition user `status` based on successful payments. Non-subscribed (meaning `BASIC` tier) users face hardcoded logic limitations (`limitation.service.ts`):
- **Employers (Basic Plan)**:
  - Can post a maximum of **5 new jobs per calendar month**.
  - **Zero updates** allowed to existing jobs during the same month without upgrading.
- **JobSeekers & Employers Interaction Limitations**:
  - `BASIC` users are restricted to receiving **1 match notification per calendar month**.
  - Employers mapping out interviews can create extremely restricted appointments (Maximum 5 global appointments/month; 1 per specific job; 1 per specific candidate limit).
- Any violation triggers an immediate `402 Payment Required` HTTP response, forcing users toward premium conversion pipelines.

### D. Data Modeling & Storage
The platform heavily segregates logic to keep base entities agile:
- **Core User Data Store**: Secures base identity mapping. Stores Hashed Passwords, Registration Emails, standard Phone and Addresses, Point-based Coordinates (Lon/Lat) for strict map scaling, Apple/Google OAuth linking metadata, and 2FA secrets.
- **JobSeeker Data Store**: Stores precise candidate details: `overview`, rich-text `about`, structured arrays of `experiences` mapping categories/salaries, and specific file references (PDF `attachments` / `resumeUrl`). Contains a global toggle (`isProfileVisible`) for privacy enforcement.
- **Employer Data Store**: Retains rigid business details: `businessCategory`, `legalForm`, Corporate identifications (`Tax No`, `DE No`), WhatsApp contact funnels, and enterprise overviews.

**Data Visibility to Employers:**
When an employer queries a candidate list securely, the payload undergoes filtration. Critical system data (like `password`, `stripeCustomerId`, Stripe data, 2FA credentials, Apple IDs) are hidden heavily via `select: 0` inside Mongoose queries. Employers receive public profile variables such as `name`, `experiences`, `overview`, `resumeUrl`, and calculated radial geographical distance from the job posting, assuring candidates privacy unless specific contact requests are initiated.

### E. Additional Enterprise Features

1. **Shift Plan System & PDF Generation:**
Employers can create internal Work Shift Schedules (`ShiftPlan`) assigned to explicitly invited registered employees (`Worker`). The backend automatically parses these MongoDB plans into a localized HTML template and utilizes `htmlToPdf` to synthesize exportable `.pdf` schedules. These files are asynchronously emailed to the remote employee's registered mailing address by leveraging integrated Nodemailer pipelines.

2. **Real-time Private Chat Engine:**
The implementation features a native inter-user messaging architecture. It uses advanced MongoDB sub-queries to instantly calculate the last sent message and total unread counts per chat list. A separate socket layer generally facilitates live event distribution across candidates and employers when matching occurs.

3. **Invoicing & Automatic Refund Lifecycles:**
All subscriptions map strictly to auto-generated native `Invoice` objects containing Stripe's `ChargeId` and `PaymentIntentId`. The backend contains strict automated refund structures: if a user or admin processes a refund, the server communicates with Stripe's Refund API to selectively remit the funds. Concurrently, the local Subscription status reverts to `CANCELED`, cutting off premium accesses and enforcing system synchronicity.

4. **Personal File Drive Space:**
Users hold access to a `Drive` management system traversing internal volumes. When assets (like generic profile files) are deposited via `multer`, the `Drive` schema tracks their virtual ownership. Deleting items directly queries OS-native `fs.unlink()` protocols, destroying orphaned blocks to systematically prevent storage bleeding.
