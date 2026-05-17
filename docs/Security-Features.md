# Security Features & Data Protection

## 1. Authentication & Authorization

- **JWT (JSON Web Tokens)**: All protected routes require a valid JWT passed in the HTTP `Authorization: Bearer <token>` header. The token is cryptographically signed using a strong `JWT_SECRET`.
- **Role-Based Access Control (RBAC)**: The backend uses an `auth(...roles)` middleware. For example, `auth('SUPER_ADMIN')` restricts access at the root layer—ensuring no unauthorized user hits the business logic.
- **TOTP / 2FA**: The application integrates Two-Factor authentication via `speakeasy`, enabling Time-based One-Time Passwords. This adds a critical secondary protective layer alongside passwords.

## 2. Data Protection (At Rest & In Transit)

- **In Transit**: The backend sits behind a trusted proxy environment (configured via `app.set('trust proxy', true)`) preparing the stack for SSL (HTTPS) termination. All sensitive data like passwords or tokens are encrypted in transit via TLS.
- **Passwords**: Passwords are **never** stored in plain text. The application uses `bcrypt` with `salt rounds` to irreversibly hash the passwords before saving them in the MongoDB database.

## 3. Request Validation & Sanitization

- **Zod Schemas**: Every API endpoint that receives data from the user goes through rigorous schema validation using **Zod** (`validateRequest(schema)` middleware).
- If a request provides extra fields, invalid types, or attempts NoSQL injection through body parameters, Zod will immediately reject the request with HTTP `400 Bad Request`.

## 4. Operational Limitations & DoS Protection

- **Payload Limits**: The Express body parser is intentionally restricted to `10mb` (`express.json({ limit: '10mb' })`). This protects the server against large payload denial-of-service crashes.
- **File Processing**: The `multer` integration manages boundaries when handling resumes and PDFs, limiting potential filesystem exhaustion attacks. Cleanup logic ensures malicious or aborted files are purged automatically from local storage.
- **Webhook Security**: Stripe webhooks utilize raw body parsers and verification secrets (`STRIPE_WEBHOOK_SECRET`) to ensure incoming payment events are strictly originating from Stripe's servers, eliminating fake payment/upgrade attempts.

## Security Level Assessment: 9 / 10 (High Security)

### Why an 9?

The application's logic is extremely solid natively. It implements standard enterprise expectations:

1. Irreversible hashing for credentials (`bcrypt`).
2. Stateless multi-role JWT verification.
3. 2FA (TOTP integration).
4. Strict typed request validation preventing NoSQL injection.
5. Standardized webhook verifications.
