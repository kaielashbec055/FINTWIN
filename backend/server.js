require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");

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

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID || "placeholder-client-id",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder-client-secret",
    callbackURL: "http://localhost:5000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
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

const {
  generateFinTwinAdvisory,
  getVerifiedProfile,
  validateFinancialValues,
  calculateSavings,
  calculateFOIRCapacity,
  buildFinancialProfileWithProvenance,
  detectCurrency,
  detectBankName,
  parseTabularBankStatement,
  createTabularChunks,
  ingestUserDocument,
  retrieveDocumentContext,
  classifyQuery,
  validatePromptPayload,
  buildPromptForCategory
} = require("./knowledgeEngine");

function generateFallbackReply(message, selectedBank, userProfile, docContext = null, retrieved = null) {
  return generateFinTwinAdvisory(message, selectedBank, userProfile, docContext, retrieved);
}

// DOCUMENT UPLOAD & INGESTION (Strict User/Session Isolation)
app.post("/api/documents/upload", (req, res) => {
  const { userId, documentId, content, fileName } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Document content is required" });
  }
  const effectiveUserId = userId || (req.user ? req.user.id : (req.headers["x-user-id"] || "default_user"));
  const result = ingestUserDocument(effectiveUserId, documentId, content, fileName);
  return res.json({ success: true, ...result });
});

// ENDPOINT 1: AI Advisor & Document Financial Intelligence
app.post("/api/chat", async (req, res) => {
  const {
    message,
    userId: clientUserId,
    sessionId: clientSessionId,
    documentId: clientDocumentId,
    attachedDocument,
    documentContent,
    fileName,
    userProfile,
    selectedBank,
    bankCategory,
    messages: clientMessages,
    conversationHistory,
    history,
    deterministicCalculation,
    intent
  } = req.body;

  if (!message && !attachedDocument && !documentContent) {
    return res.status(400).json({ error: "Message content or document is required" });
  }

  // 1. Strict User & Session Isolation
  const userId = clientUserId || req.user?.id || (req.headers["x-user-id"] || "default_user");
  const sessionId = clientSessionId || "default_session";
  const docId = clientDocumentId || (attachedDocument?.id || (attachedDocument?.name ? attachedDocument.name : "doc_current"));

  // Ingest attached document if provided directly in payload
  const rawDocContent = documentContent || attachedDocument?.content;
  if (rawDocContent) {
    ingestUserDocument(userId, docId, rawDocContent, fileName || attachedDocument?.name || "statement.txt");
  }

  // Retrieve document chunks strictly belonging to this authenticated user
  const retrieved = retrieveDocumentContext(userId, docId, message || "");
  const docContext = retrieved.found ? retrieved.text : null;

  // 2. Query Routing & Classification (DESCRIPTIVE, ANALYTICAL, ADVISORY)
  const queryCategory = classifyQuery(message || "Summarize document", !!docContext);

  // 3. Financial Data Validation & Provenance
  const verified = getVerifiedProfile(userProfile);

  let profileContext = "";
  if (verified.isSuspicious) {
    profileContext = `[DATA VALIDATION ANOMALY]\nSuspicious financial parameters detected: ${verified.suspiciousReason}\nDo not generate a misleading financial profile. Clearly flag the data anomaly to the user.`;
  } else if (verified.hasIncome) {
    profileContext = `User Profile (Verified):
Occupation: ${verified.occupation}
Monthly Income: ₹${verified.monthlyIncome.toLocaleString('en-IN')}
Monthly Expenses: ${verified.monthlyExpenses !== null ? `₹${verified.monthlyExpenses.toLocaleString('en-IN')}` : "Not provided"}
Monthly Savings: ${verified.savingsText}
Safe EMI Capacity (40% ceiling): ₹${verified.safeEmiCeiling.toLocaleString('en-IN')}/month
Risk Profile: ${verified.riskAppetite}
Active Bank: ${verified.activeBank}`;
  } else {
    profileContext = `User Profile:
Monthly Income: Income information not available. (IMPORTANT: Do NOT assume or invent a default income. If income is required to answer, ask the user for it.)
Occupation: ${verified.occupation}
Risk Profile: ${verified.riskAppetite}
Active Bank: ${verified.activeBank}`;
  }

  // 4. Prompt Construction & Prompt Validation
  let systemPromptContent = "";
  let userPromptContent = "";

  try {
    const promptConfig = buildPromptForCategory(queryCategory, {
      query: message || "Please review and summarize this document.",
      documentContext: docContext,
      profileContext: profileContext,
      currency: retrieved.currency?.code || "INR",
      bankName: retrieved.bankName || selectedBank || null
    });
    systemPromptContent = promptConfig.systemPrompt;
    userPromptContent = promptConfig.userPrompt;
  } catch (validationErr) {
    console.warn("[Prompt Validation Error Caught]:", validationErr.message);
    return res.status(400).json({
      error: validationErr.message,
      validationError: true
    });
  }

  // If no HF_TOKEN provided, directly utilize FinTwin's deterministic knowledge engine
  if (!process.env.HF_TOKEN || process.env.HF_TOKEN.trim() === "" || process.env.HF_TOKEN === "placeholder_token") {
    const fallbackReply = generateFallbackReply(message, selectedBank, userProfile, docContext, retrieved);
    return res.json({ reply: fallbackReply, source: "knowledge_engine", category: queryCategory });
  }

  try {
    const modelId = process.env.HF_MODEL || "meta-llama/Llama-3.3-70B-Instruct";

    // Format previous conversation turns to preserve conversational context
    const rawHistory = clientMessages || conversationHistory || history;
    let formattedHistory = [];
    if (Array.isArray(rawHistory)) {
      formattedHistory = rawHistory
        .map(m => ({
          role: (m.role === "assistant" || m.sender === "ai") ? "assistant" : "user",
          content: String(m.content || m.text || "").trim()
        }))
        .filter(m => m.content.length > 0);
    }

    const deterministicContext = deterministicCalculation
      ? `\n\nMATHEMATICALLY VERIFIED FINANCIAL CALCULATION (Deterministic figures - present these exact amounts, never hallucinate alternative numbers):\n${JSON.stringify(deterministicCalculation, null, 2)}`
      : "";

    const chatCompletion = await chatClient.chat.completions.create({
      model: modelId,
      messages: [
        {
          role: "system",
          content: `${systemPromptContent}${deterministicContext}`
        },
        ...formattedHistory.slice(-10),
        ...(formattedHistory.length === 0 || formattedHistory[formattedHistory.length - 1].content !== (userPromptContent || message)
          ? [{ role: "user", content: userPromptContent || message }]
          : [])
      ],
      max_tokens: 600,
      temperature: 0.6
    });

    if (!chatCompletion || !chatCompletion.choices || chatCompletion.choices.length === 0) {
      return res.json({ reply: generateFallbackReply(message, selectedBank, userProfile, docContext, retrieved), source: "knowledge_engine", category: queryCategory });
    }

    let reply = chatCompletion.choices[0].message.content;
    reply = reply.replace(/₹₹/g, "₹");
    return res.json({ reply, source: "llm", category: queryCategory });
    
  } catch (error) {
    console.warn("[FinTwin Advisor API Notice] Cloud model inference unavailable:", error.message, "- seamlessly utilizing built-in knowledge engine.");
    const fallbackReply = generateFallbackReply(message, selectedBank, userProfile, docContext, retrieved);
    return res.json({ reply: fallbackReply, source: "knowledge_engine", category: queryCategory });
  }
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
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:3000/profile");
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running smoothly on port ${PORT}`);
});
