# 💎 FinTwin — Frontend Application

Next-generation web interface for **FinTwin**, an AI-powered multi-bank personal finance, loan eligibility, document analysis, and wealth management ecosystem for retail Indian banking users.

---

## 🚀 Key Modules & Components

- **Multi-Bank Dashboard (`Homepage.js`)**: Real-time aggregated balances, account distribution, and dynamic expense tracking.
- **AI Financial Advisor (`AIAdvisor.js`)**: Interactive advisory workspace supporting document uploads, custom LLM selection (Google Gemini 2.0 Flash, OpenAI GPT-4o-mini, Hugging Face Gemma 4), and quick prompts.
- **FinTwin Smart Assistant (`chatbot/chatbot.js`)**: Floating conversational assistant widget offering rapid bank rate queries, verified portal links, and offline financial heuristics.
- **Loans & Dynamic EMI Radar (`LoansPage.js`, `LoansAndInvestments.js`)**: Comparative loan interest rates with interactive principal/interest visual charts and debt-to-income (DTI) checks.
- **Government Welfare Navigator (`SchemesPage.js`)**: Central and state welfare scheme search, personalized eligibility filters, and application guidance.
- **Milestone & Goal Planner (`GoalsPage.js`)**: Inflation-adjusted SIP calculators for retirement, home down payments, and emergency funds.
- **Encrypted Document Vault (`DocumentsPage.js`)**: Categorized storage and verification for salary slips, Form 16, bank statements, and KYC proofs.
- **Settings & AI Configuration (`SettingsPage.js`)**: Custom API key management (Gemini, OpenAI), risk tolerance updates, and language switcher.
- **Multilingual Support (`LanguageContext.js`)**: Dynamic localized translation across English, Hindi (हिंदी), Tamil (தமிழ்), Telugu (తెలుగు), and Kannada (ಕನ್ನಡ).

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm start
```
Runs the application in development mode at [http://localhost:3000](http://localhost:3000).

### 3. Run Production Build
```bash
npm run build
```
Builds the app for production to the `build` folder with optimized bundles and minification.

### 4. Run Tests
```bash
npm test
```
Launches the interactive test runner.

---

## 📁 Frontend Directory Layout

```plaintext
frontend/
├── public/
│   ├── favicon.ico
│   ├── index.html               # HTML5 entry with FinTwin metadata
│   └── manifest.json            # PWA manifest
├── src/
│   ├── components/
│   │   ├── AIAdvisor.js         # Full-page conversational financial advisor
│   │   ├── AIAdvisor.css        # Advisor styling & prompt pills
│   │   ├── BankDetails.js       # Detailed bank profiles & rates
│   │   ├── DocumentsPage.js     # Document vault
│   │   ├── GoalsPage.js         # Goal planner & milestones
│   │   ├── Homepage.js          # Core multi-bank dashboard
│   │   ├── InvestmentsPage.js   # Portfolio & asset allocation
│   │   ├── LoansPage.js         # Multi-bank loans & EMI calculator
│   │   ├── SchemesPage.js       # Government schemes navigator
│   │   ├── SettingsPage.js      # User preferences & API key controls
│   │   ├── Signin.js            # Auth signin & Google OAuth
│   │   ├── Signup.js            # User onboarding & registration
│   │   ├── auth.css             # Authentication styling
│   │   └── chatbot/
│   │       ├── chatbot.js       # FinTwin Smart Assistant widget
│   │       └── chatbot.css      # Smart Assistant styling
│   ├── context/
│   │   └── LanguageContext.js   # Multilingual i18n context provider
│   ├── data/
│   │   └── banksData.js         # Exhaustive banking catalog & rates
│   ├── utils/
│   │   ├── apiConfig.js         # API client & local/cloud fallback routing
│   │   ├── financialKnowledgeEngine.js # Client-side advisory heuristics
│   │   └── translations.js      # Multilingual dictionaries
│   ├── App.js                   # Main routes definition
│   └── index.js                 # React DOM mount point
└── package.json
```
