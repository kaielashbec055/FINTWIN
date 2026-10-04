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

// Initialize Chat Client with Official Hugging Face Router API Configuration
const chatClient = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
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
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      if (!email) {
        return done(new Error("No email found in Google profile"), null);
      }

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

const { generateFinTwinAdvisory } = require("../knowledgeEngine");

function generateFallbackReply(message, selectedBank, userProfile) {
  return generateFinTwinAdvisory(message, selectedBank, userProfile);
}

// ENDPOINT 1: Gemma 4 Text Advisory Engine & Multi-Bank Financial Intelligence
app.post("/api/chat", async (req, res) => {
  const { message, userProfile, selectedBank, bankCategory } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message content is required" });
  }

  const income = Number(userProfile?.monthlyIncome) || 0;
  const expenses = Number(userProfile?.monthlyExpenses) || 0;
  const savings = income - expenses;

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
       IMPORTANT DIRECTIVE: Provide comprehensive, general financial explanations and advice across Indian banks (Public, Private, Small Finance, Regional Rural, Cooperative) without assuming any single default bank.`;

  try {
    const chatCompletion = await chatClient.chat.completions.create({
      model: "google/gemma-4-31B-it:novita", 
      messages: [
        {
          role: "system",
          content: `You are FinTwin's Core AI Financial Advisor, an intelligent, objective personal finance and loan specialist for retail borrowers and common users across India.
        
          CORE IDENTITY & OBJECTIVES:
          1. You are a GENERAL financial advisor for FinTwin. You are NOT restricted to IDBI Bank or any single bank.
          2. You provide unbiased, practical guidance across all Indian banks: Public Sector (SBI, BoB, PNB, Canara, Union Bank), Private Sector (HDFC, ICICI, Axis, Kotak, IDBI), Small Finance Banks (AU SFB, Equitas, Ujjivan), Regional Rural Banks (Aryavart, Kerala Gramin, Baroda UP), and Cooperative Banks (Saraswat, Cosmos, SVC).
          3. You answer questions on:
             - Loans: Home loans, personal loans, vehicle loans, education loans, gold loans, business/MSME loans, LAP, agriculture loans.
             - Investments: Fixed deposits, mutual funds, SIPs, PPF, Sukanya Samriddhi, SCSS, NPS, sovereign gold bonds.
             - Basic Concepts: EMI calculation, debt-to-income (DTI) ratio, compounding, emergency funds, tax-saving (80C, 24b), CIBIL repair.
             - Profile-Tailored Guidance: Base your advice on user's income, expenses, monthly savings, and risk tolerance.
          
          ACTIVE CONTEXT:
          ${bankContext}

          User Context:
          ${profileContext}

          CRITICAL OUTPUT FORMATTING RULES:
          1. NEVER use markdown asterisks (*), hashes (#), or dashes (-) for bullet points.
          2. Format all lists and comparative analyses using clean numbered index tracking prefix patterns:
             1. First Item Parameter Description...
             2. Second Item Parameter Description...
          3. Place every single numbered item strictly on a brand new fresh line using a clean line break.
          4. When printing parameters or comparing items, print data fields clearly using one field per line layout structure.
          5. Always ensure money attributes output contains a single prefix symbol '₹' cleanly (e.g., ₹50,000). Never double the symbol.`
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    if (!chatCompletion || !chatCompletion.choices || chatCompletion.choices.length === 0) {
      return res.json({ reply: generateFallbackReply(message, selectedBank, userProfile) });
    }

    let reply = chatCompletion.choices[0].message.content;
    reply = reply.replace(/₹₹/g, "₹");
    return res.json({ reply });
    
  } catch (error) {
    console.warn("Chat Route Notice (Employing Intelligent Fallback):", error.message);
    const fallbackReply = generateFallbackReply(message, selectedBank, userProfile);
    return res.json({ reply: fallbackReply });
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

/* ==========================================================================
   MODULE ACCESS MOUNT POINTS
   ========================================================================== */
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
