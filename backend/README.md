# 💎 FinTwin — Backend API Server

High-performance RESTful API service powering **FinTwin**, featuring multi-tier AI model orchestration, deterministic financial heuristics, Firebase Firestore user persistence, and document intelligence.

---

## ⚡ Core Features

- **Multi-Tier AI Engine**:
  1. **Google Gemini 2.0 Flash** (`@google/genai`) for sub-second, context-aware financial advisory.
  2. **OpenAI GPT-4o-mini** integration.
  3. **Hugging Face Gemma 4** (`google/gemma-4-31B-it`) via InferenceClient.
  4. **FinTwin Deterministic Knowledge Engine** (`knowledgeEngine.js`) for 100% offline uptime and zero-quota dependency.
- **Document Analysis**: Context-aware explanation of Salary Slips, Form 16, Bank Statements, ITR-V, and Demat Portfolio statements.
- **Authentication**: JWT authentication, bcryptjs password hashing, and Google OAuth 2.0 session redirection with user profile sync.
- **Visual Synthesis**: FLUX.1 image generation for personalized goal visuals.

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in `backend/`:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# AI Model Keys (Optional)
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
HF_TOKEN=your_huggingface_token

# Firebase Service Account
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

### 3. Run Development Server
```bash
npm run dev
# Starts server with nodemon on port 5000
```

### 4. Run Production Server
```bash
npm start
```

---

## 📡 Key Endpoints

- `POST /api/auth/register` — User registration
- `POST /api/auth/login` — User authentication & JWT generation
- `GET /api/auth/google` — Google OAuth 2.0 authorization
- `GET /api/profile` — Fetch user financial profile
- `POST /api/profile` — Update financial metrics
- `POST /api/chat` — Multi-tier AI Financial Advisory & Document analysis
- `POST /api/generate-image` — FLUX.1 goal visualization
