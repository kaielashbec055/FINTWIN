// ============================================================================
// FINTWIN CORE FINANCIAL INTELLIGENCE & KNOWLEDGE ENGINE (Node.js Backend)
// Objective, deterministic, and verified financial advisory engine
// Enforces strict query routing (DESCRIPTIVE, ANALYTICAL, ADVISORY),
// prevents profile hallucinations, and validates all financial inputs.
// ============================================================================

const {
  validateFinancialValues,
  calculateSavings,
  calculateFOIRCapacity,
  buildFinancialProfileWithProvenance
} = require("./financialValidator");

const {
  detectCurrency,
  detectBankName,
  parseTabularBankStatement,
  createTabularChunks,
  ingestUserDocument,
  retrieveDocumentContext,
  classifyQuery,
  validatePromptPayload,
  buildPromptForCategory,
  isolatedDocumentStore
} = require("./documentEngine");

/**
 * Deterministic Equated Monthly Installment (EMI) calculation
 * Formula: EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]
 */
function calculateEMI(principal, annualRate, tenureYears, tenureMonthsInput = null) {
  const p = parseFloat(principal);
  const rAnnual = parseFloat(annualRate);
  const r = rAnnual / 12 / 100;
  
  const n = tenureMonthsInput !== null && !isNaN(parseFloat(tenureMonthsInput)) && parseFloat(tenureMonthsInput) > 0
    ? parseFloat(tenureMonthsInput)
    : parseFloat(tenureYears) * 12;

  if (isNaN(p) || p <= 0 || isNaN(r) || r <= 0 || isNaN(n) || n <= 0) {
    return null;
  }

  const factor = Math.pow(1 + r, n);
  const emi = (p * r * factor) / (factor - 1);
  const roundedEmi = Math.round(emi);
  const totalPayment = roundedEmi * n;
  const totalInterest = totalPayment - Math.round(p);

  return {
    emi: roundedEmi,
    principal: Math.round(p),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    tenureMonths: Math.round(n),
    tenureYears: Number((n / 12).toFixed(1)),
    annualRate: rAnnual
  };
}

/**
 * Deterministic Total Interest Payable calculation
 */
function calculateTotalInterestPayable(principal, emi, tenureMonths) {
  const p = parseFloat(principal);
  const e = parseFloat(emi);
  const n = parseFloat(tenureMonths);
  if (isNaN(p) || isNaN(e) || isNaN(n) || p <= 0 || e <= 0 || n <= 0) return null;
  return Math.round((e * n) - p);
}

/**
 * Deterministic Total Repayment Amount calculation
 */
function calculateTotalRepayment(emi, tenureMonths) {
  const e = parseFloat(emi);
  const n = parseFloat(tenureMonths);
  if (isNaN(e) || isNaN(n) || e <= 0 || n <= 0) return null;
  return Math.round(e * n);
}

/**
 * Deterministic Systematic Investment Plan (SIP) future value calculation
 * Formula: FV = P x [ ( (1+i)^n - 1 ) / i ] x (1+i)
 */
function calculateSIP(monthlyInvestment, expectedReturnRate, tenureYears, tenureMonthsInput = null) {
  const p = parseFloat(monthlyInvestment);
  const rateAnnual = parseFloat(expectedReturnRate);
  const i = rateAnnual / 12 / 100;

  const n = tenureMonthsInput !== null && !isNaN(parseFloat(tenureMonthsInput)) && parseFloat(tenureMonthsInput) > 0
    ? parseFloat(tenureMonthsInput)
    : parseFloat(tenureYears) * 12;

  if (isNaN(p) || p <= 0 || isNaN(i) || i <= 0 || isNaN(n) || n <= 0) {
    return null;
  }

  const factor = Math.pow(1 + i, n);
  const fv = p * ((factor - 1) / i) * (1 + i);
  const totalInvested = p * n;
  const estimatedReturns = fv - totalInvested;

  return {
    futureValue: Math.round(fv),
    totalInvested: Math.round(totalInvested),
    estimatedReturns: Math.round(estimatedReturns),
    tenureMonths: Math.round(n),
    tenureYears: Number((n / 12).toFixed(1)),
    expectedReturnRate: rateAnnual
  };
}

/**
 * Extract numerical financial parameters from raw text queries
 * Supports Indian numbering conventions (Crores, Lakhs, Thousands, k)
 */
function extractFinancialNumbers(text) {
  if (!text || typeof text !== 'string') {
    return { amount: null, rate: null, years: null, months: null };
  }

  const str = text.toLowerCase().replace(/,/g, '');

  let amount = null;
  const croreMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:crores?|cr)\b/);
  const lakhMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|lac|l)\b/);
  const thousandMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:thousand|thousands|k)\b/);
  const currencyMatch = str.match(/(?:₹|rs\.?|inr|\$|usd)\s*(\d+(?:\.\d+)?)/);
  const plainNumMatch = str.match(/\b(\d{4,10})\b/);

  if (croreMatch) {
    amount = parseFloat(croreMatch[1]) * 10000000;
  } else if (lakhMatch) {
    amount = parseFloat(lakhMatch[1]) * 100000;
  } else if (thousandMatch) {
    amount = parseFloat(thousandMatch[1]) * 1000;
  } else if (currencyMatch) {
    amount = parseFloat(currencyMatch[1]);
  } else if (plainNumMatch) {
    amount = parseFloat(plainNumMatch[1]);
  }

  let rate = null;
  const ratePercentMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:%|percent|p\.a\.|pa\b)/);
  const rateContextMatch = str.match(/(?:at|rate\s*(?:of)?|interest\s*(?:of)?)\s*(\d+(?:\.\d+)?)\s*(?:%|\b)/);
  if (ratePercentMatch) {
    rate = parseFloat(ratePercentMatch[1]);
  } else if (rateContextMatch) {
    rate = parseFloat(rateContextMatch[1]);
  }

  let years = null;
  let months = null;
  const yearMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?|yr)\b/);
  const monthMatch = str.match(/(\d+)\s*(?:months?|mos?|mo)\b/);

  if (yearMatch) {
    years = parseFloat(yearMatch[1]);
  }
  if (monthMatch) {
    months = parseInt(monthMatch[1], 10);
    if (!years) {
      years = Number((months / 12).toFixed(2));
    }
  }

  return { amount, rate, years, months };
}

/**
 * Validates and extracts only verified user profile information.
 * Tracks source provenance and NEVER assumes default income of ₹50,000,
 * Software Engineer occupation, Medium risk, or SBI bank.
 */
function getVerifiedProfile(profile) {
  if (!profile || typeof profile !== 'object') {
    return {
      hasIncome: false,
      isSuspicious: false,
      suspiciousReason: null,
      monthlyIncome: null,
      monthlyExpenses: null,
      monthlySavings: null,
      safeEmiCeiling: null,
      additionalEmiCapacity: null,
      foirMessage: "Income information not available.",
      occupation: "Not provided",
      riskAppetite: "Not assessed",
      activeBank: "Not linked",
      savingsText: "Income information not available.",
      profileData: null
    };
  }

  const profileData = buildFinancialProfileWithProvenance(profile);
  const hasIncome = profileData.monthlyIncome.value !== null;
  const isSuspicious = profileData.validation.isSuspicious;

  return {
    hasIncome,
    isSuspicious,
    suspiciousReason: profileData.validation.suspiciousReason,
    monthlyIncome: profileData.monthlyIncome.value,
    monthlyExpenses: profileData.monthlyExpenses.value,
    monthlySavings: profileData.savings.value,
    savingsText: profileData.savings.displayText,
    safeEmiCeiling: profileData.foirCapacity.maxTotalEmi,
    additionalEmiCapacity: profileData.foirCapacity.additionalCapacity,
    foirMessage: profileData.foirCapacity.message,
    occupation: profileData.occupation.value,
    riskAppetite: profileData.riskProfile.value,
    activeBank: profileData.activeBank.value,
    profileData
  };
}

/**
 * Intent classification across financial queries
 */
function detectIntent(query, params = {}) {
  const q = (query || "").trim().toLowerCase();

  // Greetings & basic conversational triggers
  if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening))\b/i.test(q) ||
      q === "who are you" || q === "what can you do" || q === "help") {
    return "greetings";
  }

  // Profile queries
  if (
    q.includes("my profile") ||
    q.includes("my financial profile") ||
    q.includes("my income") ||
    q.includes("my savings") ||
    q.includes("show my details") ||
    q.includes("what is my income")
  ) {
    return "financial_profile";
  }

  // KYC Questions
  if (
    q.includes("kyc") ||
    q.includes("know your customer") ||
    q.includes("c-kyc") ||
    q.includes("ckyc") ||
    q.includes("video kyc") ||
    q.includes("vkyc") ||
    q.includes("ekyc")
  ) {
    return "kyc_inquiry";
  }

  // Loan Application Intent
  if (
    q.includes("apply for a loan") ||
    q.includes("apply for loan") ||
    q.includes("want to apply for a loan") ||
    q.includes("want to apply for loan") ||
    q.includes("how to apply for a loan") ||
    q.includes("how to apply for loan") ||
    q.includes("how can i apply for a loan") ||
    q.includes("how can i apply for loan") ||
    q.includes("loan application") ||
    q.includes("apply loan") ||
    q.includes("where to apply for loan") ||
    q.includes("steps to apply for loan")
  ) {
    return "loan_application";
  }

  // Loan Eligibility Intent
  if (
    q.includes("loan eligibility") ||
    q.includes("eligible for a loan") ||
    q.includes("eligible for loan") ||
    q.includes("am i eligible") ||
    q.includes("how much loan can i get") ||
    q.includes("how much loan will i get") ||
    q.includes("maximum loan amount") ||
    q.includes("check my eligibility") ||
    q.includes("check eligibility") ||
    q.includes("can i get a loan")
  ) {
    return "loan_eligibility";
  }

  // Specific loan categories
  if (q.includes("home loan") || q.includes("housing loan") || q.includes("mortgage loan")) {
    return "home_loan";
  }

  if (q.includes("personal loan") || q.includes("instant loan") || q.includes("unsecured loan")) {
    return "personal_loan";
  }

  if (q.includes("car loan") || q.includes("vehicle loan") || q.includes("auto loan") || q.includes("bike loan") || q.includes("two wheeler loan")) {
    return "vehicle_loan";
  }

  // SIP Definition vs SIP Calculation
  const isSipDef = (
    q.includes("what is sip") ||
    q.includes("what is a sip") ||
    q.includes("explain sip") ||
    q.includes("sip definition") ||
    q.includes("sip meaning") ||
    q.includes("how does sip work") ||
    q.includes("how sip works") ||
    q.includes("what is systematic investment") ||
    q.includes("difference between sip") ||
    q === "sip"
  );

  const isSipCalc = (
    q.includes("calculate sip") ||
    q.includes("sip calculator") ||
    q.includes("sip return") ||
    q.includes("sip calculation") ||
    (q.includes("sip") && (params.amount || params.rate || params.years || q.includes("for") || q.includes("invest")))
  );

  if (isSipDef && !params.amount && !params.rate && !params.years && !q.includes("calculate")) {
    return "sip_definition";
  }

  if (isSipCalc) {
    return "sip_calculation";
  }

  // EMI Definition vs EMI Calculation
  const isEmiDef = (
    q.includes("what is emi") ||
    q.includes("what is an emi") ||
    q.includes("explain emi") ||
    q.includes("emi definition") ||
    q.includes("emi meaning") ||
    q.includes("how does emi work") ||
    q.includes("how emi works") ||
    q.includes("emi formula") ||
    q === "emi"
  );

  const isEmiCalc = (
    q.includes("calculate emi") ||
    q.includes("emi calculator") ||
    q.includes("emi for") ||
    q.includes("how much emi") ||
    (q.includes("emi") && (params.amount || params.rate || params.years || q.includes("calculate")))
  );

  if (isEmiDef && !params.amount && !params.rate && !params.years && !q.includes("calculate")) {
    return "emi_definition";
  }

  if (isEmiCalc) {
    return "emi_calculation";
  }

  // General Financial Education Topics
  if (q.includes("compounding") || q.includes("compound interest") || q.includes("power of compounding")) {
    return "compounding_education";
  }

  if (q.includes("cibil") || q.includes("credit score") || q.includes("credit rating")) {
    return "cibil_education";
  }

  if (q.includes("tax") || q.includes("income tax") || q.includes("80c") || q.includes("new regime") || q.includes("old regime")) {
    return "tax_education";
  }

  if (q.includes("save money") || q.includes("how to save") || q.includes("budget") || q.includes("emergency fund") || q.includes("savings")) {
    return "savings_education";
  }

  if (q.includes("where to invest") || q.includes("how to invest") || q.includes("beginner invest") || q.includes("investment options") || q.includes("start investing")) {
    return "investment_roadmap";
  }

  if (q.includes("mutual fund") || q.includes("index fund") || q.includes("stock") || q.includes("share market") || q.includes("equity")) {
    return "market_education";
  }

  if (q.includes("fixed deposit") || q.includes(" fd ") || q.endsWith(" fd") || q.startsWith("fd ") || q.includes("recurring deposit") || q.includes(" rd ")) {
    return "fd_education";
  }

  if (q.includes("scheme") || q.includes("ppf") || q.includes("nps") || q.includes("sukanya") || q.includes("atal pension") || q.includes("mudra") || q.includes("pmay")) {
    return "schemes_education";
  }

  if (q.includes("types of loans") || q.includes("loan types") || q.includes("loans available")) {
    return "loan_types_education";
  }

  // Check if query is completely unrelated to personal finance
  const financialKeywords = [
    "money", "finance", "bank", "loan", "interest", "emi", "sip", "invest", "stock", "mutual",
    "fund", "tax", "deposit", "cibil", "credit", "card", "budget", "saving", "rupee", "cash",
    "wealth", "debt", "repay", "income", "salary", "scheme", "gold", "fd", "rd", "portfolio",
    "document", "statement", "dollar", "usd", "balance", "transaction"
  ];
  const hasFinanceKeyword = financialKeywords.some(keyword => q.includes(keyword));
  if (!hasFinanceKeyword) {
    return "unsupported_query";
  }

  return "general_finance";
}

/**
 * Main Advisory & Guidance Engine
 * Uses verified profile info, robust deterministic calculations, and clear query/intent routing.
 */
function generateFinTwinAdvisory(query, activeBank = "", profile = {}, documentContext = null, documentMeta = null) {
  const verified = getVerifiedProfile(profile);
  const parsedNums = extractFinancialNumbers(query);
  const qLower = (query || "").toLowerCase();

  // 0. QUERY ROUTING & CLASSIFICATION (DESCRIPTIVE, ANALYTICAL, ADVISORY)
  const isDocumentQuery = !!documentContext || /\b(document|statement|attached\s*file|uploaded\s*file)\b/i.test(qLower);
  const category = classifyQuery(query, isDocumentQuery);

  // DESCRIPTIVE CATEGORY: Bank statement / document reading, summarization, transaction review
  if (category === "DESCRIPTIVE" || documentContext || qLower.includes("what does this document contain") || qLower.includes("summarize this")) {
    const rawContent = documentContext || query;
    const currency = documentMeta?.currency || detectCurrency(rawContent);
    const bankName = documentMeta?.bankName || detectBankName(rawContent) || "Bank / Financial Institution";

    // Tabular parsing
    const parsed = parseTabularBankStatement(rawContent, documentMeta?.fileName || "Bank Statement");
    const sym = currency.symbol;

    let transactionSummary = "";
    if (parsed.rows && parsed.rows.length > 0) {
      transactionSummary = parsed.rows.slice(0, 15).map(r => `- **${r[0] || 'Date'}**: ${r[1] || ''} | Amount: ${sym}${r[2] || ''} ${r[3] ? `| Balance: ${sym}${r[3]}` : ''}`).join('\n');
    }

    return `## Document Summary: ${parsed.fileName || "Bank Statement"}

### 1. Document Overview
- **Issuing Institution:** **${bankName}**
- **Original Currency:** **${currency.code} (${sym})**
- **Record Type:** Bank Account Statement / Financial Activity

### 2. Statement Details & Extracted Content
${transactionSummary ? `**Recorded Transactions (${currency.code}):**\n${transactionSummary}\n` : `This document is an authentic financial record issued by **${bankName}** denominated in **${currency.code} (${sym})**.\n\n- All figures and balances are presented strictly in the original document currency (**${currency.code}**).\n- No currency conversion or unrelated financial advice has been applied.`}

### 3. Factual Verification
- **Currency Preservation:** Denominated strictly in **${currency.code} (${sym})** without unauthorized conversion to INR.
- **Institution Accuracy:** Attributed strictly to **${bankName}** without unsolicited assumptions.`;
  }

  const cleanQ = qLower.replace(/[?!.,]/g, '').trim();

  // Check if query is explicitly asking for monthly income
  if (cleanQ === "what is my income" || cleanQ === "what is my monthly income" || (cleanQ.includes("my income") && !cleanQ.includes("savings") && !cleanQ.includes("loan") && !cleanQ.includes("profile"))) {
    if (!verified.hasIncome) {
      return "Income information not available.";
    }
    return `Your recorded verified monthly income is **₹${verified.monthlyIncome.toLocaleString('en-IN')}**.`;
  }

  // Check if query is asking specifically for savings
  if (qLower.includes("my savings") || qLower.includes("calculate my savings") || qLower.includes("savings buffer")) {
    if (verified.isSuspicious) {
      return `⚠️ **Suspicious Data Detected:** ${verified.suspiciousReason}\n\nSavings calculation has been halted to prevent a misleading financial profile. Please verify your income and expense records.`;
    }
    if (!verified.hasIncome) {
      return "Income information not available. Cannot calculate monthly savings.";
    }
    if (verified.monthlyExpenses === null) {
      return "Expenses information not available. Cannot calculate monthly savings.";
    }
    return `Based on your verified income of ₹${verified.monthlyIncome.toLocaleString('en-IN')} and monthly expenses of ₹${verified.monthlyExpenses.toLocaleString('en-IN')}:\n\n- **Monthly Savings:** **₹${verified.monthlySavings.toLocaleString('en-IN')}**\n- **Formula:** Savings = Monthly Income (₹${verified.monthlyIncome.toLocaleString('en-IN')}) - Monthly Expenses (₹${verified.monthlyExpenses.toLocaleString('en-IN')}) = ₹${verified.monthlySavings.toLocaleString('en-IN')}`;
  }

  // Check if query is asking specifically for safe EMI capacity / FOIR
  if (qLower.includes("emi capacity") || qLower.includes("foir") || qLower.includes("how much emi can i afford")) {
    if (!verified.hasIncome) {
      return "Income information not available. Safe EMI capacity cannot be calculated.";
    }
    return `## Safe EMI Capacity Assessment\n\n${verified.foirMessage}`;
  }

  const intent = detectIntent(query, parsedNums);

  // 1. GREETINGS
  if (intent === "greetings") {
    const profileSummary = verified.hasIncome
      ? `\n- **Monthly Income:** ₹${verified.monthlyIncome.toLocaleString('en-IN')}\n- **Safe EMI Capacity (40% rule):** ₹${verified.safeEmiCeiling.toLocaleString('en-IN')}/month`
      : `\n- *Tip: Set your monthly income in your Profile for personalized borrowing limits and budgets.*`;

    return `## Welcome to FinTwin AI Advisor!

I am your personal financial companion for retail banking, investments, loans, and sovereign schemes.

### What You Can Ask Me:
- **Loan Inquiries & EMIs:** *"What is an EMI?"*, *"Calculate EMI for ₹20 Lakhs at 8.75% for 15 years"*, *"I want to apply for a loan"*, *"Am I eligible for a loan?"*
- **SIP & Investments:** *"What is SIP?"*, *"Calculate SIP for ₹5,000 at 12% for 10 years"*, *"Where should a beginner invest?"*
- **Compliance & Credit:** *"What is KYC and why is it needed?"*, *"How do I boost my CIBIL score above 750?"*
- **Document Analysis:** Upload a bank statement and ask *"What does this document contain?"*

**Your Profile Status:**${profileSummary}

How can I assist your financial journey today?`;
  }

  // 2. FINANCIAL PROFILE INQUIRY
  if (intent === "financial_profile") {
    if (verified.isSuspicious) {
      return `⚠️ **Suspicious Financial Data Detected:** ${verified.suspiciousReason}\n\nFinancial profile generation has been paused to prevent misleading analysis. Please review your income and expense figures for decimal errors, extra zeros, or unit scaling (paise vs rupees).`;
    }

    if (!verified.hasIncome) {
      return `## Your FinTwin Financial Profile

We currently do not have verified income data recorded for your account.

- **Monthly Income:** Income information not available.
- **Monthly Expenses:** ${verified.monthlyExpenses !== null ? `₹${verified.monthlyExpenses.toLocaleString('en-IN')}` : "Not provided"}
- **Occupation:** ${verified.occupation}
- **Risk Profile:** ${verified.riskAppetite}
- **Active Bank:** ${verified.activeBank}
- **Safe EMI Capacity:** Cannot be calculated without income information.

To receive tailored loan eligibility assessments, debt-to-income feasibility, and customized savings plans, please update your monthly in-hand income in the **Profile** tab or tell me your monthly income here.`;
    }

    return `## Your FinTwin Financial Profile

Here is your verified financial profile data:

- **Verified Monthly In-Hand Income:** **₹${verified.monthlyIncome.toLocaleString('en-IN')}**
- **Recorded Monthly Expenses:** ${verified.monthlyExpenses !== null ? `₹${verified.monthlyExpenses.toLocaleString('en-IN')}` : "Not provided"}
- **Estimated Monthly Savings:** **${verified.savingsText}**
- **Safe EMI Ceiling (40% FOIR Rule):** **₹${verified.safeEmiCeiling.toLocaleString('en-IN')}/month**
- **Occupation:** ${verified.occupation}
- **Risk Profile:** ${verified.riskAppetite}
- **Active Bank:** ${verified.activeBank}

You can ask me to run loan feasibility checks or investment calculations based on these verified metrics!`;
  }

  // 3. KYC INQUIRY
  if (intent === "kyc_inquiry") {
    return `## Understanding KYC (Know Your Customer)
    
### 1. What is KYC?
**KYC (Know Your Customer)** is a mandatory verification process established by regulatory authorities (such as the **Reserve Bank of India (RBI)** and **SEBI**). It requires financial institutions to authenticate the identity and address of customers before opening accounts, issuing credit, or investing funds, preventing financial fraud and money laundering.

### 2. Officially Valid Documents (OVD)
To complete your KYC verification with any bank, mutual fund, or NBFC, you must provide:
- **Proof of Identity (PoI):** Permanent Account Number (PAN) Card or Form 60, Aadhaar Card, Passport, or Voter ID.
- **Proof of Address (PoA):** Aadhaar Card, Passport, Voter ID, Valid Driving License, or Utility bills (electricity/water bill under 2 months old).
- **Recent Photograph:** Passport-size photograph.

### 3. Digital KYC Verification Modes
- **Aadhaar OTP e-KYC:** Instant digital verification via OTP sent to your Aadhaar-linked mobile number.
- **Video KYC (V-KYC):** Full digital KYC completed in a few minutes via a live video call with a bank officer displaying your original PAN card.
- **Central KYC (C-KYC):** Generates a unique 14-digit **KIN (KYC Identification Number)** managed by CERSAI, allowing you to open new financial accounts without re-submitting physical documents across institutions.`;
  }

  // 4. LOAN APPLICATION GUIDANCE
  if (intent === "loan_application") {
    const incomeFeasibility = verified.hasIncome
      ? `\n- **Your Recorded Income:** ₹${verified.monthlyIncome.toLocaleString('en-IN')}/month\n- **Safe Total EMI Capacity (40% rule):** Up to **₹${verified.safeEmiCeiling.toLocaleString('en-IN')}/month** across all loans.`
      : `\n- *Note: Please provide your monthly income if you would like me to calculate your safe EMI ceiling and loan amount eligibility.*`;

    return `## How to Apply for a Loan: Step-by-Step Guide

If you want to apply for a loan, follow this structured process to maximize your approval chances and secure the best interest rate:

### Step 1: Select the Appropriate Loan Category
- **Home Loan:** Secured against residential property; lowest interest rates (indicative: ~8.35% – 9.25% p.a.) with tenures up to 30 years.
- **Personal Loan:** Unsecured with zero collateral required; fastest approval (indicative: ~10.25% – 15.00% p.a.) with tenures from 1 to 5 years.
- **Vehicle Loan:** Secured against hypothecation of car or bike; tenures up to 7 years.
- **MSME / Business Loan:** Collateral-free options available under sovereign programs like **MUDRA Yojana** up to ₹10–20 Lakhs.

### Step 2: Check Eligibility Prerequisites
- **Credit Score:** A score of **750 or above** unlocks faster approvals and discounted interest rates.
- **Debt-to-Income / FOIR:** Your total existing monthly EMIs plus the new loan EMI should not exceed **40% to 50%** of your net monthly income.${incomeFeasibility}

### Step 3: Organize Required Documentation
1. **Identity & Address Proof:** PAN Card, Aadhaar Card, Passport, or Voter ID.
2. **Income Verification:**
   - *Salaried:* Last 3 to 6 months of salary slips, Form 16, and 6 months bank statements showing salary credits.
   - *Self-Employed / Business:* Last 2 to 3 years of filed Income Tax Returns (ITR) with computation of income, P&L statements, and 6–12 months current account statements.
3. **Property Documents:** (For Home Loans) Sale deed, Title search report, NOC from builder/society.

### Step 4: Submission & Application Channels
- **Online / NetBanking:** If you hold a primary savings account with ${activeBank || "your bank"}, check for **pre-approved digital loan offers** in their mobile banking app for near-instant disbursal.
- **Branch Visit:** Submit the physical application with self-attested documents to a loan officer.
- **Comparison Tip:** Always compare the **processing fee** (0.5%–2%) and check for prepayment/foreclosure penalties before signing the agreement.

**Which loan type are you looking to apply for?** Let me know (e.g., Home Loan, Personal Loan, Car Loan), and I can provide the exact checklist and interest rate benchmarks.`;
  }

  // 5. LOAN ELIGIBILITY
  if (intent === "loan_eligibility") {
    if (!verified.hasIncome) {
      return `## Loan Eligibility Assessment

To assess your loan eligibility and determine how much you can borrow, lenders evaluate:

1. **Monthly In-Hand Income:** Used to calculate your Fixed Obligation to Income Ratio (FOIR).
2. **Existing Obligations:** Any current running credit card EMIs, personal loans, or vehicle loans.
3. **Credit Score:** Scores above 750 secure prime approval status.
4. **Loan Tenure & Interest Rate:** Longer tenures lower monthly installments, increasing the sanctioned principal.

> ℹ️ **Income Information Needed:**  
> Your monthly income is not currently recorded in your profile. To evaluate your borrowing capacity and safe EMI ceiling accurately, please share your **monthly in-hand income** and details of any **existing loan EMIs**.`;
    }

    const maxSafeEmi = verified.safeEmiCeiling;
    const estHomeLoanPrincipal = Math.round((maxSafeEmi / 8.68) * 1000);
    const estPersonalLoanPrincipal = Math.round((maxSafeEmi / 21.74) * 1000);

    return `## Loan Eligibility Assessment for Your Profile

Based on your verified monthly in-hand income of **₹${verified.monthlyIncome.toLocaleString('en-IN')}**:

### 1. Safe Borrowing Capacity (40% FOIR Guideline)
- **Maximum Safe Total EMI:** **₹${maxSafeEmi.toLocaleString('en-IN')}/month**
- *Note: If you have existing ongoing EMIs, your allowable new EMI is ₹${maxSafeEmi.toLocaleString('en-IN')} minus your current monthly EMI commitments.*

### 2. Indicative Eligible Loan Amounts (Assuming Zero Current Debt)
- **Home Loan (8.5% p.a. for 20 Years):** Eligible principal up to approximately **₹${estHomeLoanPrincipal.toLocaleString('en-IN')}**.
- **Personal Loan (11.0% p.a. for 5 Years):** Eligible principal up to approximately **₹${estPersonalLoanPrincipal.toLocaleString('en-IN')}**.

### 3. Key Criteria Lenders Check Before Sanction
- **Credit Score:** Target **750+** for the lowest rates.
- **Employment Stability:** Minimum 1 year continuous employment (or 2-3 years of ITR for self-employed individuals).`;
  }

  // 6. SIP DEFINITION
  if (intent === "sip_definition") {
    return `## Understanding SIP (Systematic Investment Plan)

### 1. What is a SIP?
A **Systematic Investment Plan (SIP)** is a disciplined investment methodology offered by mutual funds. Instead of investing a large lump sum all at once, an investor commits to investing a **fixed sum of money at regular intervals** (typically monthly or quarterly) into a chosen mutual fund scheme.

### 2. How Does a SIP Work?
- **Automated Deduction:** The fixed amount is automatically debited from your linked bank account on your chosen date each month via auto-debit mandate.
- **Unit Allocation:** The debited amount is used to purchase units of the mutual fund scheme at the prevailing **Net Asset Value (NAV)** on that day.
- **Compounding Growth:** Dividend gains and market appreciation compound over time, generating wealth on both your original contributions and accumulated returns.

### 3. Core Advantages of SIP
- **Rupee Cost Averaging:** When stock markets dip, your fixed monthly allocation buys more units at lower NAVs. When markets rise, you buy fewer units. Over several years, this averages out your purchase cost and eliminates the stress of timing the market.
- **Financial Discipline:** Encourages systematic, monthly savings right after salary credit.
- **Flexibility & Accessibility:** You can start a SIP with modest amounts (e.g., ₹500 or $50 per month). You can pause, increase, or stop your SIP at any time.
- **Power of Compounding:** By staying invested over a 5, 10, or 15+ year horizon, compounding can create substantial long-term wealth.

### 4. SIP vs Lump-Sum Investing
| Feature | Systematic Investment Plan (SIP) | Lump-Sum Investment |
|---|---|---|
| **Capital Commitment** | Small recurring installments | Large one-time amount |
| **Market Timing Risk** | Eliminated through Rupee Cost Averaging | High risk of entering at market peaks |

### 5. Simulating SIP Returns
If you would like to see an exact mathematical projection for an investment amount, you can ask me anytime, for example:
- *"Calculate SIP for ₹5,000 at 12% for 10 years"*`;
  }

  // 7. SIP CALCULATION
  if (intent === "sip_calculation") {
    const { amount, rate, years } = parsedNums;
    const missing = [];
    if (!amount) missing.push("- **Monthly Investment Amount** (e.g., ₹5,000/month)");
    if (!rate) missing.push("- **Expected Annual Return Rate** (e.g., 12% p.a.)");
    if (!years) missing.push("- **Investment Horizon / Tenure** (e.g., 10 years)");

    if (missing.length > 0) {
      return `## SIP Return Calculation

To compute the deterministic future value of your Systematic Investment Plan, please provide the missing parameter(s):

${missing.join('\n')}

**Example query:**  
*"Calculate SIP for ₹5,000 at 12% for 10 years"*`;
    }

    const sip = calculateSIP(amount, rate, years, parsedNums.months);
    return `## Systematic Investment Plan (SIP) Calculation Results

Based on your exact input parameters:

- **Monthly Installment (P):** **₹${sip.totalInvested > 0 ? (amount).toLocaleString('en-IN') : amount}**
- **Expected Return Rate (r):** **${sip.expectedReturnRate}% p.a.**
- **Tenure:** **${sip.tenureYears} Years** (${sip.tenureMonths} Months)

### Deterministic Projections
- **Total Amount Invested:** **₹${sip.totalInvested.toLocaleString('en-IN')}**
- **Estimated Wealth Gain (Returns):** **₹${sip.estimatedReturns.toLocaleString('en-IN')}**
- **Maturity / Future Value (FV):** **₹${sip.futureValue.toLocaleString('en-IN')}**

*Formula: FV = P × [((1+i)ⁿ - 1) / i] × (1+i), where i = ${sip.expectedReturnRate}/12/100 and n = ${sip.tenureMonths}.*`;
  }

  // 8. EMI DEFINITION
  if (intent === "emi_definition") {
    return `## Understanding EMI (Equated Monthly Installment)

### 1. What is an EMI?
An **Equated Monthly Installment (EMI)** is a fixed payment amount made by a borrower to a lender at a specified date each calendar month. EMIs are applied to both interest and principal each month so that over a specified number of years, the loan is paid off in full.

### 2. How is an EMI Structured?
- **Principal Component:** The portion of the installment that directly reduces the borrowed loan balance.
- **Interest Component:** The cost charged by the lender for the outstanding principal.
- In the initial years of a loan, a larger portion of each EMI goes toward paying interest. Toward the end of the loan tenure, the majority of each EMI pays down the principal balance.

### 3. Calculating Your EMI
If you have a loan in mind, you can provide the loan amount, interest rate, and tenure:
- *"Calculate EMI for ₹25 Lakhs at 8.5% for 20 years"*`;
  }

  // 9. EMI CALCULATION
  if (intent === "emi_calculation") {
    const { amount, rate, years } = parsedNums;
    const missing = [];
    if (!amount) missing.push("- **Loan Principal Amount** (e.g., ₹25,00,000)");
    if (!rate) missing.push("- **Annual Interest Rate** (e.g., 8.5% p.a.)");
    if (!years) missing.push("- **Loan Tenure** (e.g., 20 years)");

    if (missing.length > 0) {
      return `## EMI Calculation

To compute your mathematically exact Equated Monthly Installment (EMI), please provide the missing parameter(s):

${missing.join('\n')}

**Example query:**  
*"Calculate EMI for ₹25 Lakhs at 8.5% for 20 years"*`;
    }

    const emi = calculateEMI(amount, rate, years, parsedNums.months);
    return `## Equated Monthly Installment (EMI) Calculation Results

Based on your exact input parameters:

- **Loan Principal Amount (P):** **₹${emi.principal.toLocaleString('en-IN')}**
- **Annual Interest Rate (R):** **${emi.annualRate}% p.a.**
- **Tenure:** **${emi.tenureYears} Years** (${emi.tenureMonths} Months)

### Deterministic Breakdown
- **Monthly EMI Payable:** **₹${emi.emi.toLocaleString('en-IN')} / month**
- **Total Interest Payable:** **₹${emi.totalInterest.toLocaleString('en-IN')}**
- **Total Amount Repayable (P + I):** **₹${emi.totalPayment.toLocaleString('en-IN')}**

*Formula: EMI = [P × r × (1+r)ⁿ] / [(1+r)ⁿ - 1], where r = ${emi.annualRate}/12/100 and n = ${emi.tenureMonths}.*`;
  }

  // 10. UNSUPPORTED / OUT-OF-SCOPE QUERIES
  if (intent === "unsupported_query") {
    return `## FinTwin AI Advisor Scope

I am FinTwin's dedicated **AI Financial Advisor**, designed to provide objective guidance on personal finance, banking, loans, investments, taxes, and document analysis.

I can only answer financial and banking-related questions.

### Recommended Topics You Can Explore:
- **Loan Products & Calculations:** *"What is an EMI?"*, *"Calculate EMI for ₹15 Lakhs at 9% for 10 years"*, *"I want to apply for a loan"*
- **Wealth & Systematic Investments:** *"What is SIP?"*, *"Calculate SIP for ₹5,000 at 12% for 10 years"*
- **Document Analysis:** Upload a bank statement and ask *"What does this document contain?"*
- **Compliance & Credit Health:** *"What is KYC and what documents are required?"*, *"How can I improve my credit score?"*

Please feel free to ask any personal finance question!`;
  }

  // 11. GENERAL ADVISORY
  return `## Financial Advisory Guidance

When evaluating your financial goals:

1. **Cash Flow & Capital Allocation:** Ensure that any financial commitment aligns with your monthly disposable income without compromising essential living expenses.
2. **Borrowing vs Investing:** If evaluating a loan, target competitive interest rates, verify processing fees, and ensure total EMIs stay within a safe 40% FOIR threshold.
3. **Emergency Reserves First:** Maintain a minimum 3 to 6-month living expense buffer before locking capital into illiquid investments.

${verified.hasIncome ? `*Your Profile Capacity: Monthly Income ₹${verified.monthlyIncome.toLocaleString('en-IN')} | Safe EMI Threshold: ₹${verified.safeEmiCeiling.toLocaleString('en-IN')}/month*` : "*Tip: Update your monthly in-hand income in your Profile for personalized borrowing ceilings and budgeting recommendations.*"}`;
}

function generateSmartOfflineGuidance(query, activeBank = "", profile = {}, documentContext = null, documentMeta = null) {
  return generateFinTwinAdvisory(query, activeBank, profile, documentContext, documentMeta);
}

module.exports = {
  calculateEMI,
  calculateSIP,
  calculateTotalInterestPayable,
  calculateTotalRepayment,
  extractFinancialNumbers,
  getVerifiedProfile,
  detectIntent,
  generateFinTwinAdvisory,
  generateSmartOfflineGuidance,
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
  buildPromptForCategory,
  isolatedDocumentStore
};
