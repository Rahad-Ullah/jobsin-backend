# 🚀 JobsinApp | Backend Server

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)

An **AI-driven recruiting and hiring platform** designed to bridge the gap between talent and opportunity. This robust backend provides a secure, scalable, and high-performance foundation for the JobsinApp ecosystem.

---

## 🛠 Tech Stack

| Category           | Technologies                                                                 |
| ------------------ | ---------------------------------------------------------------------------- |
| **Runtime & Lang** | TypeScript, Node.js                                                         |
| **Framework** | Express.js                                                                  |
| **Database** | MongoDB (via Mongoose)                                                      |
| **Security** | JWT (JSON Web Tokens), Bcrypt                                               |
| **Validation** | Zod                                                                         |
| **Utilities** | Multer, NodeMailer, Socket.io, Morgan                                       |
| **AI & APIs** | DeepSeek AI, Google Place API, Google Translate API, Stripe                 |
| **Logging** | Winston, Winston-Daily-Rotate-File                                          |
| **Code Quality** | ESLint, Prettier                                                            |

---

## ✨ Key Features

* 🔐 **Secure Authentication:** Multi-layered system using JWT and Bcrypt for salted password hashing.
* 🧠 **AI Integration:** Powered by DeepSeek for intelligent recruiting insights.
* 💳 **Payments:** Seamless transaction handling integrated with Stripe.
* 📂 **File Management:** Optimized file uploads via Multer with automated cleanup using `fs.unlink`.
* 📧 **Automated Mailing:** Real-time email notifications and alerts through NodeMailer.
* 🌐 **Geo & Translation:** Location intelligence and multi-language support via Google APIs.
* 📊 **Operational Excellence:** Request logging with Morgan and structured error logging with Winston.

---

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites
* **Node.js** (v16.x or higher recommended)
* **npm** or **yarn**
* **MongoDB** (Local or Atlas instance)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/zasulehry/jobsinappserver.git
   cd jobsinappserver
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # OR
   yarn install
   ```

3. **Configure Environment:**
   Create a `.env` file in the root directory and populate it with your credentials:

   ```bash
   SERVER_NAME=JobsinApp
   NODE_ENV=development
   DATABASE_URL=your_db_url
   IP_ADDRESS=your_server_ip
   PORT=5000
   PORT_DEV=5004
   FRONTEND_URL=frontend_site_url
   BACKEND_URL=backend_url

   # Bcrypt
   BCRYPT_SALT_ROUNDS=12

   # JWT
   JWT_SECRET=jwt_secret
   JWT_EXPIRE_IN=7d

   # Email
   EMAIL_FROM=your_business_email
   EMAIL_REPLY_TO=your_business_email
   EMAIL_USER=your_business_email
   EMAIL_PASS=email_password_or_api_key
   EMAIL_PORT=587
   EMAIL_HOST=your_email_host

   # Admin credentials
   SUPER_ADMIN_EMAIL=your_admin_email
   SUPER_ADMIN_PASSWORD=your_admin_password

   # Stripe
   STRIPE_PUBLIC_KEY=your_stripe_public_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=stripe_webhook_secret_key

   # Deepseek API Key
   DEEPSEEK_API_KEY=your_deepseek_api_key

   # Google Place API Key
   GOOGLE_PLACE_API_KEY=your_google_place_api_key

   # Google Translate API Key
   GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key
   GOOGLE_TRANSLATE_PROJECT_ID=google_translate_project_id
   ```

4. **Launch Server:**
   ```bash
   npm run dev
   # OR
   yarn dev
   ```

---

## 👨‍💻 Developer

Built with ❤️ by [**Rahad Ullah**](mailto:rahadullah10@gmail.com)

> "Turning complex problems into elegant, efficient code."

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Rahad-Ullah)
[![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge&logo=react&logoColor=white)](https://rahadullah.vercel.app)

---

### Happy Coding 🚀