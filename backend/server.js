require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const jwt = require("jsonwebtoken");

const { db } = require("./config/firebase");

// 1. CHAT CLIENT: Official OpenAI client for Hugging Face Router Gateway Engine
const { OpenAI } = require("openai");

// 2. IMAGE CLIENT: Official InferenceClient for FLUX Image Generation
const { InferenceClient } = require("@huggingface/inference");

const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "mysecretkey",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Validate the Hugging Face Token Environment Variable
if (!process.env.HF_TOKEN) {
  console.warn("WARNING: HF_TOKEN is not defined in your environment variables!");
}

const chatClient = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN || "placeholder_token",
});

const imageClient = new InferenceClient(process.env.HF_TOKEN);

const googleClientID = process.env.GOOGLE_CLIENT_ID || "1022674931649-snp98iijgkg51ie5c31j5tc94r3ie7m4.apps.googleusercontent.com";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

let isGoogleAuthEnabled = false;
if (googleClientID && googleClientSecret) {
  try {
    passport.use(new GoogleStrategy(
      {
        clientID: googleClientID,
        clientSecret: googleClientSecret,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback"
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = (profile.emails && profile.emails[0]) ? profile.emails[0].value : `${profile.id}@gmail.com`;
          const usersRef = db.collection("users");
          
          const snapshot = await usersRef.where("email", "==", email).limit(1).get();
          let user = null;

          if (snapshot.empty) {
            const newUserRef = await usersRef.add({
              name: profile.displayName,
              email: email,
              googleId: profile.id,
              createdAt: new Date().toISOString(),
              profileCompleted: false
            });
            
            user = { id: newUserRef.id, name: profile.displayName, email };
          } else {
            const doc = snapshot.docs[0];
            user = { id: doc.id, ...doc.data() };
          }

          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    ));
    isGoogleAuthEnabled = true;
    console.log("Google OAuth Strategy registered successfully.");
  } catch (err) {
    console.error("Notice: Could not initialize Google OAuth Strategy:", err.message);
  }
} else {
  console.log("Notice: GOOGLE_CLIENT_SECRET not set in .env yet. Google OAuth endpoints will show informative prompt.");
}

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const userDoc = await db.collection("users").doc(id).get();
    if (!userDoc.exists) {
      return done(new Error("User not found"), null);
    }
    const user = { id: userDoc.id, ...userDoc.data() };
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

/* ==========================================================================
   AI WORKSPACE ROUTE CHANNELS (INTEGRATED DIRECTLY IN SERVER.JS)
   ========================================================================== */

const { generateFinTwinAdvisory } = require("./knowledgeEngine");

// Optional: Initialize Google GenAI if GEMINI_API_KEY is available
let geminiClient = null;
if (process.env.GEMINI_API_KEY) {
  try {
    const { GoogleGenAI } = require("@google/genai");
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    console.warn("Notice: Gemini client could not be initialized:", err.message);
  }
}

function generateFallbackReply(message, selectedBank, userProfile, attachedFile) {
  return generateFinTwinAdvisory(message, selectedBank, userProfile, attachedFile);
}

// ENDPOINT 1: Dual-Engine AI Financial Advisory (Gemini / HF with Instant Intelligent Fallback)
app.post("/api/chat", async (req, res) => {
  const { message, userProfile, selectedBank, bankCategory, attachedFile } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message content is required" });
  }

  const rawIncomeVal = typeof userProfile?.monthlyIncome === "string" 
    ? userProfile.monthlyIncome.replace(/[₹,]/g, "") 
    : userProfile?.monthlyIncome;
  const rawExpensesVal = typeof userProfile?.monthlyExpenses === "string" 
    ? userProfile.monthlyExpenses.replace(/[₹,]/g, "") 
    : userProfile?.monthlyExpenses;

  const income = Number(rawIncomeVal) || 0;
  const expenses = Number(rawExpensesVal) || 0;
  const savings = Math.max(income - expenses, 0);

  const profileContext = userProfile 
    ? `User Profile:
       Occupation: ${userProfile.occupation || "Not Specified"}
       Monthly Income: ₹${income.toLocaleString('en-IN')}
       Monthly Expenses: ₹${expenses.toLocaleString('en-IN')}
       Monthly Savings: ₹${savings.toLocaleString('en-IN')}
       Risk Appetite: ${userProfile.riskAppetite || "Medium"}`
    : "No financial profile metrics provided.";

  const bankContext = selectedBank 
    ? `Active Bank Selected by User: ${selectedBank}${bankCategory ? ` (Category: ${bankCategory})` : ""}.
       IMPORTANT DIRECTIVE: When the user asks questions referring to "this bank", "its loan products", or bank-specific interest rates, answer specifically for ${selectedBank}.`
    : `No specific bank is currently selected by the user.
       IMPORTANT DIRECTIVE: Provide comprehensive, practical guidance across Indian banks (Public, Private, Small Finance, Regional Rural, Cooperative) without assuming any single default bank.`;

  const docInstruction = (attachedFile || message.includes("[Attached Document:"))
    ? `\nDOCUMENT ANALYSIS & EXPLANATION DIRECTIVE:
The user has attached a document named "${attachedFile?.name || 'financial file'}".
When the user asks to explain the document (or "what is this document"):
1. Clearly identify what document this is (e.g. Salary Slip, Bank Statement, Form 16, ITR-V, Loan Sanction Letter, Insurance Policy, Demat Portfolio, KYC Proof).
2. Explain its primary purpose and who issues it.
3. Detail its key components and numbers (Gross/Net, Deductions, Balances, Rates, etc.).
4. Describe its role in Indian banking, loan underwriting, and tax compliance.
5. Provide practical verification tips and security advice.`
    : "";

  // 1. Attempt Google Gemini if API Key is configured (from .env or frontend payload)
  const activeGeminiKey = req.body?.geminiApiKey || req.body?.apiKey || process.env.GEMINI_API_KEY;
  if (activeGeminiKey && typeof activeGeminiKey === "string" && activeGeminiKey.trim()) {
    try {
      const { GoogleGenAI } = require("@google/genai");
      const client = new GoogleGenAI({ apiKey: activeGeminiKey.trim() });
      const prompt = `You are FinTwin's Core AI Financial Advisor, an intelligent, objective personal finance, loan, and investment specialist for retail borrowers and savers across India.
Context:
${bankContext}
${profileContext}
${docInstruction}

User Query: ${message}

Instructions:
Provide a clear, accurate, practical response tailored to Indian personal finance. Format cleanly with bullet points, numbered steps, and ₹ currency symbols.`;

      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
      });

      if (response && response.text) {
        return res.json({ reply: response.text });
      }
    } catch (geminiError) {
      console.warn("Gemini Advisory Route Notice (Switching to Intelligent Knowledge Engine):", geminiError.message);
    }
  }

  // 2. Attempt OpenAI if OPENAI_API_KEY is configured
  const activeOpenAIKey = req.body?.openaiApiKey || process.env.OPENAI_API_KEY;
  if (activeOpenAIKey && typeof activeOpenAIKey === "string" && activeOpenAIKey.trim()) {
    try {
      const { OpenAI: OpenAISDK } = require("openai");
      const oai = new OpenAISDK({ apiKey: activeOpenAIKey.trim() });
      const completion = await oai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: `You are FinTwin's Core AI Financial Advisor for retail Indian users. Context: ${bankContext} ${profileContext} ${docInstruction}` 
          },
          { role: "user", content: message }
        ],
        max_tokens: 700
      });
      if (completion?.choices?.[0]?.message?.content) {
        return res.json({ reply: completion.choices[0].message.content });
      }
    } catch (oaiError) {
      console.warn("OpenAI Route Notice:", oaiError.message);
    }
  }

  // 3. Attempt Hugging Face Router if a real HF_TOKEN is configured
  const hasValidHfToken = process.env.HF_TOKEN && 
    process.env.HF_TOKEN !== "placeholder_token" && 
    !process.env.HF_TOKEN.includes("placeholder");

  if (hasValidHfToken) {
    try {
      const chatCompletion = await chatClient.chat.completions.create({
        model: "google/gemma-4-31B-it:novita", 
        messages: [
          {
            role: "system",
            content: `You are FinTwin's Core AI Financial Advisor, an intelligent personal finance and loan specialist for retail borrowers across India.
Provide unbiased guidance across Public Sector, Private, Small Finance, Regional Rural, and Cooperative Banks.
Active Bank Context: ${bankContext}
User Context: ${profileContext}
${docInstruction}`
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 600,
        temperature: 0.7
      });

      if (chatCompletion?.choices?.[0]?.message?.content) {
        let reply = chatCompletion.choices[0].message.content.replace(/₹₹/g, "₹");
        return res.json({ reply });
      }
    } catch (hfError) {
      console.warn("HuggingFace Route Notice (Switching to Intelligent Knowledge Engine):", hfError.message);
    }
  }

  // 4. Resilient Deterministic Knowledge Engine (Always accurate, 100% uptime, zero quota limits)
  const reply = generateFallbackReply(message, selectedBank, userProfile, attachedFile);
  return res.json({ reply });
});

// ENDPOINT 2: FLUX.1 Image Generation Engine
app.post("/api/generate-image", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Image description prompt is required" });
  }

  try {
    const imageBlob = await imageClient.textToImage({
      provider: "fal-ai",
      model: "black-forest-labs/FLUX.1-dev",
      inputs: prompt,
      parameters: { num_inference_steps: 5 },
    });

    const arrayBuffer = await imageBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    return res.json({ 
      success: true,
      imageData: base64Image 
    });

  } catch (error) {
    console.error("FLUX Generation Route Failure Log:", error);
    return res.status(500).json({ 
      error: "Failed to generate image via FLUX engine layer",
      details: error.message 
    });
  }
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));

app.get("/api/auth/google",
  (req, res, next) => {
    if (!isGoogleAuthEnabled) {
      return res.redirect("http://localhost:3000/signin?error=" + encodeURIComponent("Google Client Secret is not configured in backend/.env yet. Please paste your secret and restart the server."));
    }
    passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })(req, res, next);
  }
);

app.get("/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:3000/signin?error=" + encodeURIComponent("Google authentication was not completed or failed.") }),
  (req, res) => {
    try {
      const payload = {
        user: {
          id: req.user.id
        }
      };
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || "mysecretkey",
        { expiresIn: "1d" }
      );

      const userParams = new URLSearchParams({
        oauth_token: token,
        id: req.user.id || "",
        name: req.user.name || "",
        email: req.user.email || "",
        age: req.user.age || "",
        phone: req.user.phone || "",
        occupation: req.user.occupation || "",
        employmentType: req.user.employmentType || "",
        city: req.user.city || "",
        dependents: req.user.dependents || "",
        monthlyIncome: req.user.monthlyIncome || "",
        monthlyExpenses: req.user.monthlyExpenses || "",
        riskTolerance: req.user.riskTolerance || "",
        investmentTimeline: req.user.investmentTimeline || "",
        financialGoals: req.user.financialGoals || ""
      });

      res.redirect(`http://localhost:3000/signin?${userParams.toString()}`);
    } catch (err) {
      console.error("OAuth token generation error:", err);
      res.redirect("http://localhost:3000/signin?error=" + encodeURIComponent("Failed to generate login session token."));
    }
  }
);

app.get("/api/auth/facebook", (req, res) => {
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    return res.redirect("http://localhost:3000/signin?error=" + encodeURIComponent("Facebook App ID & Secret are not configured in backend/.env yet."));
  }
  res.redirect("http://localhost:3000/signin?error=" + encodeURIComponent("Facebook authentication service connecting..."));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running smoothly on port ${PORT}`);
});
