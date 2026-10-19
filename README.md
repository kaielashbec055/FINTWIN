<div align="center">

# 💎 FinTwin
### *Next-Generation AI-Powered Multi-Bank Personal Finance, Loans & Wealth Management Ecosystem*

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![AI-Engine](https://img.shields.io/badge/AI-Gemini%202.0%20Flash%20%7C%20Gemma%204%20%7C%20GPT--4o--mini-blueviolet?logo=google&logoColor=white)](https://ai.google.dev/)
[![Leaflet](https://img.shields.io/badge/Maps-Leaflet%20OSM-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

<p align="center">
  <b>Unifying fragmented bank accounts, intelligent loan eligibility matching, automated wealth projection, document intelligence, and government subsidy navigation into a single, cohesive, multilingual experience.</b>
</p>

[Key Features](#-key-features) • [System Architecture](#-system-architecture) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [API Reference](#-api-endpoints) • [Contributing](#-contributing)

---

</div>

## 📌 Overview

Managing personal finances across multiple Indian financial institutions is notoriously fragmented. Retail borrowers struggle to evaluate loan offers objectively, while everyday savers miss out on optimal wealth growth and high-impact government welfare programs.

**FinTwin** solves this by delivering a centralized, intelligent financial operating system:
- **Unified Multi-Bank Dashboard**: Aggregate and track balances, cash flows, and transactions across Public, Private, Small Finance, and Regional Rural Banks.
- **Multi-Tier AI Financial Advisory**: Powered by Google Gemini 2.0 Flash, OpenAI GPT-4o-mini, Hugging Face Gemma 4, and an offline-resilient deterministic financial knowledge engine for personalized advice on debt reduction, taxation (New vs. Old Regime under Budget 2024/2025), and portfolio rebalancing.
- **Smart Lending & Dynamic EMI Radar**: Compare real-time interest rates, run visual loan amortizations, and verify borrowing eligibility across India's top lending institutions.
- **Document Intelligence**: Upload and verify critical financial documents (Salary Slips, Form 16, Bank Statements, Demat CAS, Loan Sanction letters) with instant AI-driven breakdowns.
- **Interactive FinTwin Smart Assistant**: Floating conversational AI assistant offering instant bank comparisons, official portal deep-links, and rapid financial calculations.
- **Comprehensive Wealth Management**: Track Mutual Funds, Equity, Fixed Deposits, Gold (SGB), and Crypto with risk scoring and compound growth projections.
- **Government Welfare Navigator**: Discover relevant central & state welfare schemes, subsidies, and grants with one-click eligibility matching.

---

## ✨ Key Features

### 🏦 1. Multi-Bank Account Aggregation & ATM/Branch Radar
- **Multi-Bank Support**: Pre-configured profiles and balance tracking for **State Bank of India (SBI)**, **HDFC Bank**, **ICICI Bank**, **Axis Bank**, **Punjab National Bank (PNB)**, **Kotak Mahindra**, **Bank of Baroda**, Small Finance Banks, and Regional Rural Banks.
- **Geo-Enabled Locator**: Interactive OpenStreetMap / Leaflet radar with location search to find nearby bank branches and ATMs.
- **Deep-Dive Portals**: Bank-specific views detailing interest slabs, net banking links, and customer support.

### 🤖 2. Multi-Tier FinTwin AI Financial Advisor
- **Resilient AI Orchestration**: Seamless multi-tiered fallback architecture ensuring 100% uptime:
  1. **Tier 1 (Google Gemini 2.0 Flash)**: Ultra-fast, context-rich reasoning via `@google/genai`.
  2. **Tier 2 (OpenAI GPT-4o-mini)**: Comprehensive secondary LLM inference.
  3. **Tier 3 (Hugging Face Router - Gemma 4)**: Open-weights inference via Hugging Face InferenceClient.
  4. **Tier 4 (FinTwin Offline Knowledge Engine)**: Built-in deterministic heuristics that work completely offline with zero quota limits or external API dependencies.
- **Tailored Personalization**: Dynamically incorporates user metrics (Monthly Income, Fixed Expenses, Savings Rate, Risk Appetite, Occupation) into every recommendation.
- **Domain Specializations**:
  - Debt payoff strategies (Snowball vs. Avalanche)
  - Tax optimization for New vs. Old Tax Regimes under current Finance Acts
  - Emergency fund readiness & CIBIL score enhancement roadmap
  - Quick action prompt shortcuts for rapid financial analysis

### 📄 3. Document Analysis & Verification Engine
- **Supported Formats**: Salary Slips, Form 16, Bank Statements, ITR-V Ack receipts, Loan Sanction Letters, Insurance Policies, and Demat Holdings.
- **Automated Breakdown**: Explains purpose, issuing authority, gross/net splits, deductions, interest rates, and loan underwriting significance.
- **Practical Checklists**: Highlights security guidelines (password protection, verified summaries) and official verification steps.

### 💬 4. FinTwin Smart Assistant (Conversational Chatbot)
- **Floating Interactive Widget**: Collapsible, responsive widget accessible from anywhere in the application.
- **Instant Bank & Rate Lookup**: One-click queries for home loan, personal loan, car loan, and education loan rates across all major banks.
- **Direct Official Links**: Instant navigation buttons to verified banking and government portals.
- **Hybrid Response Engine**: Automatically queries active backend AI endpoints with instant deterministic fallback.

### 💳 5. Intelligent Loans & Dynamic Visual EMI Calculator Hub
- **Multi-Category Loans**: Compare Home Loans, Personal Loans, Vehicle Loans, and Education Loans side-by-side.
- **Interactive Visual EMI Calculator**: Dynamic sliders for loan principal, tenure, and interest rate with live Recharts pie charts displaying Total Interest vs. Principal.
- **Eligibility Assessment**: Automatic debt-to-income (DTI) calculations to highlight safe borrowing limits.

### 📈 6. Wealth & Investment Portfolio Tracker
- **Asset Allocation Breakdown**: Real-time visualization of portfolios across Stocks, Mutual Funds, Fixed Deposits, Gold, Real Estate, and Digital Assets.
- **SIP & Compounding Projections**: Interactive calculators illustrating 5, 10, and 20-year wealth growth under conservative, moderate, and aggressive CAGR assumptions.
- **Risk Profiling**: Dynamic suggestions aligned with conservative, balanced, or aggressive risk appetites.

### 🏛️ 7. Central & State Government Welfare Schemes Navigator
- **Comprehensive Scheme Catalog**: Direct access to schemes including **PM Jan Dhan Yojana (PMJDY)**, **Atal Pension Yojana (APY)**, **Sukanya Samriddhi Yojana (SSY)**, **Pradhan Mantri Awas Yojana (PMAY)**, **Sovereign Gold Bonds (SGB)**, and **PM-KISAN**.
- **Personalized Eligibility Filter**: Instant matching based on age, income brackets, gender, and employment status.
- **Direct Application Links**: Official portal links and documentation checklists for seamless enrollment.

### 🎯 8. Financial Goal Planner & Target Milestones
- **Target Tracking**: Dedicated trackers for Emergency Fund, Home Down Payment, Vehicle Purchase, Higher Education, and Retirement.
- **Automated Monthly SIP Required**: Calculates the exact monthly savings required to hit deadlines based on inflation and expected returns.

### 🔐 9. Authentication & Security
- **Flexible Login Options**: Secure email/password login, Google OAuth 2.0 social sign-in, and one-click Fast Demo Guest Login.
- **Stateless Bearer Tokens**: Cryptographically signed JWTs with automatic session persistence and secure profile restoration.
- **Encrypted Document Vault**: Store and manage categorized identity and financial proofs with verification badges.

### 🌐 10. Multilingual Accessibility
- **Full Localization**: Seamlessly switch between **English**, **Hindi (हिंदी)**, **Tamil (தமிழ்)**, **Telugu (తెలుగు)**, and **Kannada (ಕನ್ನಡ)**.
- **Dynamic Context**: Instant UI string and numeric formatting updates via React's `LanguageContext`.

---

## 🛠️ Tech Stack

| Domain | Technology / Library | Description |
|---|---|---|
| **Frontend Framework** | **React 18** | High-performance component-driven user interface |
| **Routing** | **React Router DOM v6** | Client-side routing and protected view transitions |
| **Data Visualization** | **Recharts** | Smooth, responsive Area, Bar, and Pie charts |
| **Icons & Design** | **Lucide React** + **React Icons** | Modern, accessible iconography |
| **Maps & Geolocation** | **Leaflet** + **React-Leaflet** | Interactive OpenStreetMap integration & branch search |
| **Styling** | **Custom CSS3 / Glassmorphic Design System** | Modern dark-mode UI with polished animations & cards |
| **Backend Framework** | **Node.js** + **Express.js (v5)** | Modular REST API server with middleware architecture |
| **Database** | **Firebase Firestore** | Scalable NoSQL cloud database for users & profiles |
| **Authentication** | **JWT** + **Bcrypt.js** + **Passport.js** | Secure password hashing, JWT sessions, and Google OAuth |
| **AI Advisory (Tier 1)** | **Google Gemini 2.0 Flash** (`@google/genai`) | High-speed, high-accuracy conversational advisory engine |
| **AI Advisory (Tier 2)** | **OpenAI GPT-4o-mini** (`openai`) | Secondary cloud LLM advisory integration |
| **AI Advisory (Tier 3)** | **Google Gemma 4** (via Hugging Face) | Deep open-weights financial conversational advisor |
| **AI Advisory (Tier 4)** | **FinTwin Deterministic Knowledge Engine** | Built-in offline fallback rules for 24/7 reliability |
| **Image Generation** | **FLUX.1-dev** (via InferenceClient) | Generative image synthesis engine for financial goals |

## 📂 Project Directory Structure

```plaintext
FINTWIN/
├── backend/
│   ├── config/
│   │   └── firebase.js          # Firebase Admin SDK & Firestore initialization
│   ├── middleware/
│   │   └── auth.middleware.js   # JWT authentication verification middleware
│   ├── models/
│   │   ├── Profile.js           # Profile schema definitions
│   │   └── User.js              # User model definitions
│   ├── routes/
│   │   ├── ai.js                # Multi-tier AI conversation & image generation endpoints
│   │   ├── auth.js              # User registration, login, and JWT tokens
│   │   └── profile.js           # Financial profile & asset registry routes
│   ├── knowledgeEngine.js       # Offline-resilient financial knowledge & rule base
│   ├── server.js                # Express server entrypoint & AI routing pipeline
│   ├── .env                     # Backend environment configuration
│   └── package.json             # Backend dependencies & npm scripts
│
├── frontend/
│   ├── public/                  # Public assets, favicon, index.html, manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIAdvisor.js     # Conversational AI financial advisor component
│   │   │   ├── BankDetails.js   # Detailed view for specific banking institutions
│   │   │   ├── DocumentsPage.js # Encrypted document vault & management
│   │   │   ├── GoalsPage.js     # Goal tracking and target milestone planner
│   │   │   ├── Homepage.js      # Core aggregated multi-bank dashboard
│   │   │   ├── InvestmentsPage.js# Asset allocations & portfolio projection
│   │   │   ├── LoansPage.js     # Multi-bank loan comparison & dynamic EMI calculator
│   │   │   ├── SchemesPage.js   # Central & State government schemes directory
│   │   │   ├── SettingsPage.js  # User preferences, API keys & language settings
│   │   │   ├── Signin.js        # Authentication sign-in & Google OAuth portal
│   │   │   ├── Signup.js        # New user onboarding & account creation
│   │   │   ├── assets.js        # User asset listing & valuation module
│   │   │   └── chatbot/
│   │   │       ├── chatbot.js   # FinTwin Smart Assistant floating widget
│   │   │       └── chatbot.css  # Floating chatbot styling
│   │   ├── context/
│   │   │   └── LanguageContext.js # Dynamic multilingual provider & hooks
│   │   ├── data/
│   │   │   └── banksData.js     # Exhaustive data catalog of Indian banks & schemes
│   │   ├── pages/
│   │   │   └── LandingPage.js   # High-converting landing page & product showcase
│   │   ├── utils/
│   │   │   ├── apiConfig.js     # Smart API client with local/cloud fallback
│   │   │   ├── financialKnowledgeEngine.js # Client-side advisory heuristics
│   │   │   └── translations.js  # Multilingual dictionary (EN, HI, TA, TE, KN)
│   │   ├── App.js               # Application routing configuration
│   │   └── index.js             # React DOM root entry
│   └── package.json             # Frontend dependencies & npm scripts
│
└── README.md                    # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.x or higher installed ([Download Node.js](https://nodejs.org/))
- **npm** (v9+) or **yarn**
- **Firebase Project**: A Firestore database instance ([Firebase Console](https://console.firebase.google.com/))
- **AI Keys (Optional)**:
  - `GEMINI_API_KEY`: For Google Gemini 2.0 Flash ([Google AI Studio](https://aistudio.google.com/))
  - `OPENAI_API_KEY`: For OpenAI GPT-4o-mini ([OpenAI Platform](https://platform.openai.com/))
  - `HF_TOKEN`: For Hugging Face Gemma 4 / FLUX.1 ([Hugging Face Tokens](https://huggingface.co/settings/tokens))
  *(FinTwin operates seamlessly using its built-in offline Knowledge Engine if cloud keys are omitted)*

---

### 1. Clone the Repository
```bash
git clone https://github.com/kaielashbec055/FINTWIN.git
cd FINTWIN
```

---

### 2. Configure Backend

Navigate to the `backend` directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in `backend/.env`:
```env
PORT=5000
SESSION_SECRET=your_super_secret_session_key
JWT_SECRET=your_jwt_signing_key_here

# AI Model Keys (Optional - offline engine activates automatically if omitted)
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
HF_TOKEN=your_huggingface_access_token_here

# Firebase Configuration (paste the JSON stringified service account)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

> **Note**: Alternatively, place your `firebase-service-account.json` directly into the `backend/` directory.

Start the backend development server:
```bash
npm run dev
# Server will start on http://localhost:5000
```

---

### 3. Configure Frontend

Open a new terminal window, navigate to the `frontend` directory and install dependencies:
```bash
cd ../frontend
npm install
```

Start the frontend application:
```bash
npm start
# Application will launch on http://localhost:3000
```

---

## ⚙️ Environment Variables Reference

| Variable | Description | Required | Default |
|---|---|---|---|
| `PORT` | Port number for the Express API server | No | `5000` |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens | Yes | `default_jwt_secret` |
| `SESSION_SECRET` | Secret key for express session management | Yes | `mysecretkey` |
| `GEMINI_API_KEY` | Google Gemini API key for Gemini 2.0 Flash | Optional | *(Falls back to next tier / Knowledge Engine)* |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o-mini | Optional | *(Falls back to next tier / Knowledge Engine)* |
| `HF_TOKEN` | Hugging Face Access Token for Gemma 4 & FLUX.1 | Optional | *(Falls back to Knowledge Engine)* |
| `FIREBASE_SERVICE_ACCOUNT` | Raw JSON string of Firebase service credentials | Optional | Reads `firebase-service-account.json` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID for social login | Optional | `placeholder-client-id` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret for social login | Optional | `placeholder-client-secret` |

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new user account with hashed password.
- `POST /api/auth/login` — Authenticate credentials and return signed JWT + user profile.
- `GET /api/auth/google` — Initiate Google OAuth 2.0 social login flow.
- `GET /api/auth/google/callback` — OAuth redirection callback handler.

### 👤 User Profile & Assets (`/api/profile`)
- `GET /api/profile` — Fetch the authenticated user's financial profile *(Requires Bearer Token)*.
- `POST /api/profile` — Initialize or update baseline financial metrics.
- `POST /api/profile/assets` — Add a new asset record (FD, mutual fund, property, equity) to user portfolio.

### 🧠 AI Financial Advisor (`/api/chat`)
- `POST /api/chat` — Submit user queries alongside active financial snapshot.
  ```json
  {
    "message": "Should I prepay my home loan or invest in an index fund?",
    "selectedBank": "State Bank of India",
    "userProfile": {
      "monthlyIncome": 85000,
      "monthlyExpenses": 40000,
      "riskAppetite": "Medium"
    },
    "attachedFile": {
      "name": "Salary_Slip_August.pdf"
    }
  }
  ```
  **Response:**
  ```json
  {
    "reply": "1. Comparison Analysis: Your home loan interest rate is approx 8.50%...\n2. Recommended Strategy: Direct 60% of surplus to prepayments..."
  }
  ```

### 🎨 Visual Synthesis (`/api/generate-image`)
- `POST /api/generate-image` — Generate tailored financial goal visualization assets using `FLUX.1-dev`.

---

## 🛡️ Security & Privacy Architecture

- **Industry-Standard Encryption**: Passwords stored in Firestore are salted and hashed using `bcryptjs`.
- **Stateless Bearer Tokens**: Authenticated requests require cryptographically validated JWTs with defined expiration windows.
- **Fail-Safe Fallbacks**: No sensitive financial data is shared with external model endpoints if external API calls fail or are deactivated; computations fall back to the secure, localized in-memory knowledge engine.
- **Zero Raw Account Exposure**: FinTwin operates on sanitized profile inputs and user-consented records, adhering to privacy-by-design principles.

---

## 🤝 Contributing

Contributions make the open-source community an inspiring place to learn, inspire, and create. Any contributions to **FinTwin** are **greatly appreciated**!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ for modern retail banking & financial empowerment.</sub>
</div>
