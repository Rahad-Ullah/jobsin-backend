# Backend Logic & Architecture Documentation

## Overview
The JobsinApp backend is designed with a scalable, modular architecture using **Node.js, Express.js, and TypeScript**. The architecture follows the **Controller-Service-Route** (often akin to MVC) pattern which strictly separates concerns and ensures clean code maintainability.

## Architectural Flow
Every incoming request goes through the following lifecycle:
1. **Router (`Routes`)**: Defines the API endpoints (`/api/v1/...`) and routes the incoming request to the specific Controller. Handles middleware execution (e.g., Auth, Zod Validation).
2. **Controller**: Extracts data (body, params, query) from the HTTP request, invokes the corresponding Service function, and sends back the formatted HTTP response (using a standard overarching `sendResponse` utility). 
3. **Service (`Business Logic Layer`)**: This is where the core logic lives. It processes data, communicates with external APIs (like DeepSeek, Stripe, Google APIs), and performs database interactions.
4. **Model/DB (`Mongoose Layer`)**: The data layer that defines MongoDB schemas and interacts with the database.

## Core Modules (`src/app/modules`)
The application is feature-sliced into independent modules. Below are the prominent ones:

### 1. `auth` & `user` & `totp`
- Manages user registrations, logins, profile updates.
- Responsible for JWT generation, token verification, and password resets.
- Integrates Google Two-Factor Authentication (TOTP) through `speakeasy`.

### 2. `job` & `category` & `application`
- **Job**: Handling job postings, fetching job details, AI-based matching, and categorization.
- **Application**: Managing user job applications and tracking application statuses.

### 3. `subscription` & `stripeEvent` & `package` & `invoice`
- Integrates **Stripe** for handling sub-payments and auto-renewals.
- Validates webhooks strictly securely to manage user premium tiers, usage limitations, and invoicing.

### 4. `appointment` & `chat` & `message`
- Real-time communication structures. Includes socket-based authentication and messaging architectures for seamless user-to-user communication.

### 5. Utilities & Shared Services
- **Mailing**: Using `nodemailer` for transactional emails.
- **Uploads**: Handling file uploads (like Resume/PDFs) through `multer`, safely stored and occasionally cleaned up using `fs.unlink`.
- **AI & APIs**: Modularized integration of DeepSeek AI for recruitment intelligence, Google Translate, and Google Places.

## Middlewares used in Logic
- `validateRequest`: Intercepts the request and parses the body against a **Zod** schema. If validation fails, it throws a standard error before reaching the controller.
- `auth`: A guard middleware checking roles. E.g., `auth('ADMIN')` completely blocks standard users.

## Error Handling Logic
Instead of sprinkling `try-catch` blocks randomly, the application utilizes a `globalErrorHandler`. Any synchronous or asynchronous errors are passed to the `next(error)` function. The global error handler strictly interprets the error (Zod Error, Mongoose Validation Error, JWT Error) and maps it into a consistent JSON format with actionable messages.
