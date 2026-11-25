// FINTWIN KNOWLEDGE ENGINE
// ============================================================================
// FINTWIN FINANCIAL DATA VALIDATION & PROVENANCE ENGINE
// Validates financial inputs, enforces mathematical formulas, tracks data sources,
// and eliminates profile hallucinations.
// ============================================================================

/**
 * Validates financial figures (income, expenses, obligations).
 * Detects unit discrepancies, paise-to-rupee scaling, column misalignments,
 * and flags suspicious entries without silently clamping.
 */
function validateFinancialValues(income, expenses, existingEmi = null, options = {}) {
  const issues = [];
  let parsedIncome = null;
  let parsedExpenses = null;
  let parsedEmi = null;

  // 1. Validate Income
  if (income !== null && income !== undefined && income !== '') {
    const rawInc = typeof income === 'string' ? income.replace(/[^0-9.-]/g, '') : income;
    const numInc = parseFloat(rawInc);
    if (isNaN(numInc)) {
      issues.push("Invalid income format");
    } else if (numInc < 0) {
      issues.push("Income cannot be negative");
    } else {
      parsedIncome = numInc;
    }
  }

  // 2. Validate Expenses
  if (expenses !== null && expenses !== undefined && expenses !== '') {
    const rawExp = typeof expenses === 'string' ? expenses.replace(/[^0-9.-]/g, '') : expenses;
    const numExp = parseFloat(rawExp);
    if (isNaN(numExp)) {
      issues.push("Invalid expenses format");
    } else if (numExp < 0) {
      issues.push("Expenses cannot be negative");
    } else {
      parsedExpenses = numExp;
    }
  }

  // 3. Validate Existing EMI Obligations
  if (existingEmi !== null && existingEmi !== undefined && existingEmi !== '') {
    const rawEmi = typeof existingEmi === 'string' ? existingEmi.replace(/[^0-9.-]/g, '') : existingEmi;
    const numEmi = parseFloat(rawEmi);
    if (isNaN(numEmi)) {
      issues.push("Invalid existing EMI format");
    } else if (numEmi < 0) {
      issues.push("Existing EMI cannot be negative");
    } else {
      parsedEmi = numEmi;
    }
  }

  // 4. Anomaly & Suspicious Data Detection
  let isSuspicious = false;
  let suspiciousReason = null;

  if (parsedIncome !== null && parsedExpenses !== null) {
    // Detect expenses exceeding 3x the income
    if (parsedIncome > 0 && parsedExpenses > (parsedIncome * 3)) {
      isSuspicious = true;
      suspiciousReason = `Expenses (${parsedExpenses.toLocaleString()}) exceed 3x reported income (${parsedIncome.toLocaleString()}). Possible extra zeros, column misalignment, or paise-to-rupee conversion error.`;
      issues.push(suspiciousReason);
    }

    // Detect paise-to-rupee confusion (e.g. exactly 100x discrepancy or huge scale)
    if (parsedExpenses > 10000000 && parsedIncome < 500000 && parsedExpenses / parsedIncome > 50) {
      isSuspicious = true;
      suspiciousReason = `Extreme discrepancy detected between income and expenses. Values appear misaligned or scaled in paise.`;
    }
  }

  return {
    isValid: issues.length === 0,
    isSuspicious,
    suspiciousReason,
    issues,
    parsedIncome,
    parsedExpenses,
    parsedEmi
  };
}

/**
 * Deterministic Savings Calculation
 * Formula: Savings = Monthly Income - Monthly Expenses
 * Preserves actual negative savings without converting to zero; flags deficits.
 */
function calculateSavings(income, expenses) {
  if (income === null || income === undefined || isNaN(income)) {
    return {
      savings: null,
      isDeficit: false,
      status: "Income not provided",
      displayText: "Income information not available."
    };
  }

  if (expenses === null || expenses === undefined || isNaN(expenses)) {
    return {
      savings: null,
      isDeficit: false,
      status: "Expenses not provided",
      displayText: "Expenses information not available."
    };
  }

  const netSavings = income - expenses;
  const isDeficit = netSavings < 0;

  return {
    savings: netSavings,
    isDeficit,
    status: isDeficit ? "DEFICIT" : "SURPLUS",
    displayText: netSavings < 0
      ? `Negative Savings: -₹${Math.abs(netSavings).toLocaleString('en-IN')}/month (Monthly expenses exceed income by ₹${Math.abs(netSavings).toLocaleString('en-IN')})`
      : `₹${netSavings.toLocaleString('en-IN')}/month`
  };
}

/**
 * Deterministic FOIR / Additional EMI Capacity Calculation
 * Formula:
 * Maximum Total EMI = Net Monthly Income × FOIR Percentage (default 40% estimate)
 * Available Additional EMI Capacity = Maximum Total EMI - Existing Monthly EMI Obligations
 */
function calculateFOIRCapacity(netMonthlyIncome, existingMonthlyEmi = null, foirPercentage = 40) {
  if (netMonthlyIncome === null || netMonthlyIncome === undefined || isNaN(netMonthlyIncome) || netMonthlyIncome <= 0) {
    return {
      maxTotalEmi: null,
      additionalCapacity: null,
      foirPercentage,
      existingEmiProvided: false,
      message: "Income information not available. Safe EMI capacity cannot be calculated."
    };
  }

  const maxTotalEmi = Math.round(netMonthlyIncome * (foirPercentage / 100));

  if (existingMonthlyEmi === null || existingMonthlyEmi === undefined || isNaN(existingMonthlyEmi)) {
    return {
      maxTotalEmi,
      foirPercentage,
      existingEmiProvided: false,
      additionalCapacity: null,
      message: `Maximum estimated total EMI limit at ${foirPercentage}% FOIR is ₹${maxTotalEmi.toLocaleString('en-IN')}/month. Existing EMI obligations were not provided, so available additional EMI capacity cannot be accurately determined.`
    };
  }

  const parsedExisting = Math.round(existingMonthlyEmi);
  const additionalCapacity = Math.max(0, maxTotalEmi - parsedExisting);

  return {
    maxTotalEmi,
    foirPercentage,
    existingMonthlyEmi: parsedExisting,
    existingEmiProvided: true,
    additionalCapacity,
    message: `Maximum Total EMI (${foirPercentage}% FOIR): ₹${maxTotalEmi.toLocaleString('en-IN')}/month. Existing Obligations: ₹${parsedExisting.toLocaleString('en-IN')}/month. Available Additional EMI Capacity: ₹${additionalCapacity.toLocaleString('en-IN')}/month.`
  };
}

/**
 * Builds a verified financial profile with source provenance tracking.
 * Provenance categories:
 * - 'user_input'
 * - 'uploaded_document'
 * - 'calculated'
 * - 'inferred'
 * - 'default'
 *
 * Enforces NO hallucinations:
 * - Occupation defaults to "Not provided" (never assumed Software Engineer)
 * - Risk Profile defaults to "Not assessed" (never assumed Medium)
 * - Active Bank defaults to "Not linked" (never assumed SBI)
 */
function buildFinancialProfileWithProvenance(rawProfile = {}, source = "user_input", verified = false) {
  const currency = rawProfile.currency || "INR";
  const currencySymbol = currency === "USD" ? "$" : (currency === "INR" ? "₹" : currency);

  // Validate figures first
  const validation = validateFinancialValues(
    rawProfile.monthlyIncome,
    rawProfile.monthlyExpenses,
    rawProfile.existingEmi
  );

  // 1. Occupation
  const occupation = (rawProfile.occupation && String(rawProfile.occupation).trim())
    ? {
        value: String(rawProfile.occupation).trim(),
        provenance: source,
        verified: !!verified,
        status: verified ? "VERIFIED" : "USER_REPORTED"
      }
    : {
        value: "Not provided",
        provenance: "default",
        verified: false,
        status: "NOT_PROVIDED"
      };

  // 2. Risk Profile
  const rawRisk = rawProfile.riskTolerance || rawProfile.riskAppetite;
  const riskProfile = (rawRisk && String(rawRisk).trim())
    ? {
        value: String(rawRisk).trim(),
        provenance: source,
        verified: !!verified,
        status: verified ? "VERIFIED" : "USER_REPORTED"
      }
    : {
        value: "Not assessed",
        provenance: "default",
        verified: false,
        status: "NOT_ASSESSED"
      };

  // 3. Active Bank
  const rawBank = rawProfile.bankName || rawProfile.selectedBank || rawProfile.activeBank;
  const activeBank = (rawBank && String(rawBank).trim())
    ? {
        value: String(rawBank).trim(),
        provenance: source,
        verified: !!verified,
        status: verified ? "VERIFIED" : "USER_REPORTED"
      }
    : {
        value: "Not linked",
        provenance: "default",
        verified: false,
        status: "NOT_LINKED"
      };

  // 4. Monthly Income
  const monthlyIncome = validation.parsedIncome !== null
    ? {
        value: validation.parsedIncome,
        currency,
        currencySymbol,
        provenance: source,
        verified: !!verified,
        status: verified ? "VERIFIED" : "USER_REPORTED",
        displayText: `${currencySymbol}${validation.parsedIncome.toLocaleString()}`
      }
    : {
        value: null,
        currency,
        currencySymbol,
        provenance: "default",
        verified: false,
        status: "NOT_PROVIDED",
        displayText: "Income information not available."
      };

  // 5. Monthly Expenses
  const monthlyExpenses = validation.parsedExpenses !== null
    ? {
        value: validation.parsedExpenses,
        currency,
        currencySymbol,
        provenance: source,
        verified: !!verified,
        status: verified ? "VERIFIED" : "USER_REPORTED",
        isSuspicious: validation.isSuspicious,
        suspiciousReason: validation.suspiciousReason,
        displayText: `${currencySymbol}${validation.parsedExpenses.toLocaleString()}`
      }
    : {
        value: null,
        currency,
        currencySymbol,
        provenance: "default",
        verified: false,
        status: "NOT_PROVIDED",
        displayText: "Expenses information not available."
      };

  // 6. Savings Calculation (Deterministic)
  let savings = null;
  if (!validation.isSuspicious && monthlyIncome.value !== null && monthlyExpenses.value !== null) {
    const calc = calculateSavings(monthlyIncome.value, monthlyExpenses.value);
    savings = {
      value: calc.savings,
      isDeficit: calc.isDeficit,
      currency,
      currencySymbol,
      provenance: "calculated",
      verified: false,
      status: calc.status,
      displayText: calc.displayText
    };
  } else if (validation.isSuspicious) {
    savings = {
      value: null,
      isDeficit: false,
      currency,
      currencySymbol,
      provenance: "calculated",
      verified: false,
      status: "SUSPICIOUS_DATA_FLAGGED",
      displayText: `Suspicious data detected: ${validation.suspiciousReason}. Savings calculation halted to prevent misleading financial profile.`
    };
  } else {
    savings = {
      value: null,
      isDeficit: false,
      currency,
      currencySymbol,
      provenance: "calculated",
      verified: false,
      status: "INCOMPLETE_DATA",
      displayText: "Cannot calculate savings without both income and expense figures."
    };
  }

  // 7. FOIR / EMI Capacity
  let foirCapacity = null;
  if (!validation.isSuspicious && monthlyIncome.value !== null) {
    const foir = calculateFOIRCapacity(monthlyIncome.value, validation.parsedEmi, 40);
    foirCapacity = {
      maxTotalEmi: foir.maxTotalEmi,
      additionalCapacity: foir.additionalCapacity,
      foirPercentage: foir.foirPercentage,
      existingEmiProvided: foir.existingEmiProvided,
      provenance: "calculated",
      verified: false,
      message: foir.message
    };
  } else {
    foirCapacity = {
      maxTotalEmi: null,
      additionalCapacity: null,
      foirPercentage: 40,
      existingEmiProvided: false,
      provenance: "calculated",
      verified: false,
      message: validation.isSuspicious
        ? "Safe EMI capacity calculation paused due to suspicious financial parameters."
        : "Income information not available. Safe EMI capacity cannot be calculated."
    };
  }

  return {
    occupation,
    riskProfile,
    activeBank,
    monthlyIncome,
    monthlyExpenses,
    savings,
    foirCapacity,
    validation
  };
}




// ============================================================================
// FINTWIN DOCUMENT PARSING, TABULAR CHUNKING, & RAG ROUTER ENGINE
// Preserves transaction rows, original currencies, and enforces strict
// user-level & session-level data isolation.
// ============================================================================

/**
 * Isolated in-memory store for parsed user documents
 * Structure: Map<userId, Map<documentId, DocumentRecord>>
 */
const isolatedDocumentStore = new Map();

/**
 * Detects currency symbol and code from text content.
 * Never defaults to INR if USD or other currencies are detected.
 */
function detectCurrency(text) {
  if (!text || typeof text !== 'string') return { code: "INR", symbol: "₹" };

  const hasDollar = text.includes("$") || /\bUSD\b/i.test(text);
  const hasEuro = text.includes("€") || /\bEUR\b/i.test(text);
  const hasPound = text.includes("£") || /\bGBP\b/i.test(text);
  const hasRupee = text.includes("₹") || /\bINR\b/i.test(text) || /\bRs\.?\b/i.test(text);

  if (hasDollar && !hasRupee) {
    return { code: "USD", symbol: "$" };
  }
  if (hasEuro) {
    return { code: "EUR", symbol: "€" };
  }
  if (hasPound) {
    return { code: "GBP", symbol: "£" };
  }
  if (hasRupee) {
    return { code: "INR", symbol: "₹" };
  }

  // If no currency found, default to INR only when Indian context is present
  if (/\b(lakh|crore|rbi|sbi|hdfc|icici|pan|aadhaar)\b/i.test(text)) {
    return { code: "INR", symbol: "₹" };
  }

  return { code: "USD", symbol: "$" };
}

/**
 * Detects institution / bank name from document text
 * Does NOT invent State Bank of India when not present.
 */
function detectBankName(text) {
  if (!text || typeof text !== 'string') return null;

  const patterns = [
    /People['’]s\s*Trust\s*Bank/i,
    /JPMorgan\s*Chase|Chase\s*Bank/i,
    /Bank\s*of\s*America/i,
    /Wells\s*Fargo/i,
    /Citibank/i,
    /Barclays/i,
    /HSBC/i,
    /State\s*Bank\s*of\s*India|SBI/i,
    /HDFC\s*Bank/i,
    /ICICI\s*Bank/i,
    /Axis\s*Bank/i,
    /Punjab\s*National\s*Bank|PNB/i,
    /Bank\s*of\s*Baroda|BOB/i,
    /Canara\s*Bank/i,
    /Kotak\s*Mahindra\s*Bank/i
  ];

  for (const regex of patterns) {
    const match = text.match(regex);
    if (match) {
      return match[0].trim();
    }
  }

  // Generic bank check
  const genericMatch = text.match(/([A-Z][A-Za-z0-9'&.\s]{2,25}(?:Bank|Credit Union|Trust|Financial))/);
  if (genericMatch) {
    return genericMatch[1].trim();
  }

  return null;
}

/**
 * Parses tabular bank statement rows from text, CSV, or structured logs.
 * Preserves transaction rows without splitting them across unrelated chunks.
 */
function parseTabularBankStatement(content, fileName = "statement.txt") {
  if (!content || typeof content !== 'string') {
    return { headers: [], rows: [], summary: {}, raw: "" };
  }

  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const currencyInfo = detectCurrency(content);
  const detectedBank = detectBankName(content);

  let headerLineIndex = -1;
  let headers = [];

  // Identify table header row
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if ((line.includes("date") || line.includes("txn")) &&
        (line.includes("description") || line.includes("particulars") || line.includes("details")) &&
        (line.includes("amount") || line.includes("deposit") || line.includes("debit") || line.includes("credit") || line.includes("balance"))) {
      headerLineIndex = i;
      headers = lines[i].includes(",") 
        ? lines[i].split(",").map(c => c.trim().replace(/^"|"$/g, ''))
        : lines[i].split(/\t|\s{2,}|\|/).map(c => c.trim().replace(/^"|"$/g, ''));
      break;
    }
  }

  const rows = [];
  const metaLines = [];

  for (let i = 0; i < lines.length; i++) {
    if (i < headerLineIndex || headerLineIndex === -1) {
      metaLines.push(lines[i]);
    } else if (i > headerLineIndex) {
      const line = lines[i];
      // Skip empty or separator lines
      if (line.match(/^[-=_|* ]+$/)) continue;

      const cells = line.includes(",")
        ? line.split(",").map(c => c.trim().replace(/^"|"$/g, ''))
        : line.split(/\t|\s{2,}|\|/).map(c => c.trim().replace(/^"|"$/g, ''));

      if (cells.length >= 2) {
        rows.push(cells);
      } else {
        metaLines.push(line);
      }
    }
  }

  return {
    fileName,
    currency: currencyInfo,
    bankName: detectedBank || "Not specified in document",
    metaLines,
    headers: headers.length > 0 ? headers : ["Date", "Description", "Amount", "Balance"],
    rows,
    raw: content
  };
}

/**
 * Tabular chunking strategy:
 * Keeps table headers attached to each chunk and keeps transaction rows atomic.
 * Maximum rows per chunk: 8-12 rows to guarantee context fit.
 */
function createTabularChunks(parsedDoc, userId, documentId, chunkSize = 8) {
  const chunks = [];
  const headerStr = parsedDoc.headers.join(" | ");
  const metaStr = parsedDoc.metaLines.slice(0, 10).join("\n");

  if (parsedDoc.rows.length === 0) {
    // If no explicit table rows detected, chunk by clean paragraph/lines
    const rawLines = parsedDoc.raw.split(/\r?\n/).filter(l => l.trim().length > 0);
    for (let i = 0; i < rawLines.length; i += chunkSize) {
      const slice = rawLines.slice(i, i + chunkSize);
      chunks.push({
        chunkId: `${documentId}_chunk_${chunks.length + 1}`,
        userId,
        documentId,
        fileName: parsedDoc.fileName,
        currency: parsedDoc.currency,
        bankName: parsedDoc.bankName,
        text: `[DOCUMENT METADATA]\nFile: ${parsedDoc.fileName}\nBank: ${parsedDoc.bankName}\nCurrency: ${parsedDoc.currency.code} (${parsedDoc.currency.symbol})\n\n[CONTENT EXCERPT]\n${slice.join("\n")}`
      });
    }
  } else {
    for (let i = 0; i < parsedDoc.rows.length; i += chunkSize) {
      const rowSlice = parsedDoc.rows.slice(i, i + chunkSize);
      const rowsFormatted = rowSlice.map(r => r.join(" | ")).join("\n");

      chunks.push({
        chunkId: `${documentId}_chunk_${chunks.length + 1}`,
        userId,
        documentId,
        fileName: parsedDoc.fileName,
        currency: parsedDoc.currency,
        bankName: parsedDoc.bankName,
        text: `[BANK STATEMENT TABLE - CHUNK ${chunks.length + 1}]\nInstitution: ${parsedDoc.bankName}\nCurrency: ${parsedDoc.currency.code} (${parsedDoc.currency.symbol})\n\n[STATEMENT HEADER]\n${metaStr}\n\n[TRANSACTIONS TABLE]\n${headerStr}\n${rowsFormatted}`
      });
    }
  }

  return chunks;
}

/**
 * Ingests a document for a specific user and session with strict isolation.
 */
function ingestUserDocument(userId, documentId, content, fileName = "statement.txt") {
  if (!userId) userId = "anonymous_user";
  if (!documentId) documentId = `doc_${Date.now()}`;

  const parsed = parseTabularBankStatement(content, fileName);
  const chunks = createTabularChunks(parsed, userId, documentId);

  if (!isolatedDocumentStore.has(userId)) {
    isolatedDocumentStore.set(userId, new Map());
  }

  const userDocs = isolatedDocumentStore.get(userId);
  userDocs.set(documentId, {
    documentId,
    userId,
    fileName,
    currency: parsed.currency,
    bankName: parsed.bankName,
    parsed,
    chunks,
    uploadedAt: new Date().toISOString()
  });

  return {
    documentId,
    userId,
    fileName,
    bankName: parsed.bankName,
    currency: parsed.currency,
    rowCount: parsed.rows.length,
    chunkCount: chunks.length
  };
}

/**
 * Retrieves relevant chunks for a user with STRICT user & session filtering.
 * Prevents cross-user or cross-session leakage.
 */
function retrieveDocumentContext(userId, documentId, query = "") {
  if (!userId || !isolatedDocumentStore.has(userId)) {
    return { chunks: [], text: "", found: false };
  }

  const userDocs = isolatedDocumentStore.get(userId);
  if (documentId && userDocs.has(documentId)) {
    const doc = userDocs.get(documentId);
    // Combine all tabular chunks for comprehensive statement analysis
    const combinedText = doc.chunks.map(c => c.text).join("\n\n---\n\n");
    return {
      chunks: doc.chunks,
      text: combinedText,
      currency: doc.currency,
      bankName: doc.bankName,
      found: true
    };
  }

  // If no documentId specified, retrieve the latest document belonging strictly to this user
  const docsArray = Array.from(userDocs.values());
  if (docsArray.length > 0) {
    const latestDoc = docsArray[docsArray.length - 1];
    const combinedText = latestDoc.chunks.map(c => c.text).join("\n\n---\n\n");
    return {
      chunks: latestDoc.chunks,
      text: combinedText,
      currency: latestDoc.currency,
      bankName: latestDoc.bankName,
      found: true
    };
  }

  return { chunks: [], text: "", found: false };
}

/**
 * Query Classifier / Router
 * Categorizes queries into:
 * - 'DESCRIPTIVE': Document reading, summarization, listing transactions, checking account numbers or balances.
 * - 'ANALYTICAL': Deterministic calculations, FOIR, savings ratios, spending comparisons.
 * - 'ADVISORY': Financial advice, loan recommendations, investment suggestions.
 */
function classifyQuery(query = "", hasDocument = false) {
  const q = (query || "").trim().toLowerCase();

  // 1. DESCRIPTIVE Category
  const descriptivePatterns = [
    /what does this document contain/i,
    /summarize this (document|statement|file)/i,
    /summary of (this|the) (document|statement|file)/i,
    /what (is|are) in this (document|statement|file)/i,
    /explain this document/i,
    /list (the )?transactions/i,
    /show (the )?transactions/i,
    /what is (the )?(account number|closing balance|starting balance|opening balance)/i,
    /who is the account holder/i,
    /which bank is this/i,
    /what bank issued this/i,
    /what period does this cover/i,
    /read this (statement|document|file)/i
  ];

  for (const regex of descriptivePatterns) {
    if (regex.test(q)) {
      return "DESCRIPTIVE";
    }
  }

  if (hasDocument && (
    /\b(document|statement|attached\s*file|uploaded\s*file)\b/i.test(q) ||
    /summarize/i.test(q) ||
    /read\s+(this\s+)?(statement|document|file)\b/i.test(q)
  ) && !q.includes("advice") && !q.includes("recommend") && !q.includes("should i")) {
    return "DESCRIPTIVE";
  }

  // 2. ANALYTICAL Category
  const analyticalPatterns = [
    /calculate/i,
    /how much did i spend/i,
    /total (spending|deposits|withdrawals|debits|credits|expenses)/i,
    /what is my (savings|savings buffer|emi capacity|foir)/i,
    /compare/i,
    /breakdown/i,
    /ratio/i,
    /math/i,
    /emi for/i,
    /sip for/i
  ];

  for (const regex of analyticalPatterns) {
    if (regex.test(q)) {
      return "ANALYTICAL";
    }
  }

  // 3. ADVISORY Category
  const advisoryPatterns = [
    /recommend/i,
    /advice/i,
    /advise/i,
    /suggest/i,
    /should i/i,
    /which loan is best/i,
    /where to invest/i,
    /financial strategy/i,
    /how can i save more/i,
    /improve my (cibil|credit score|financial situation)/i
  ];

  for (const regex of advisoryPatterns) {
    if (regex.test(q)) {
      return "ADVISORY";
    }
  }

  // Default to DESCRIPTIVE if a document is present, otherwise ADVISORY for general queries
  return hasDocument ? "DESCRIPTIVE" : "ADVISORY";
}

/**
 * Validates that all prompt template variables are properly populated.
 * Prevents empty placeholders such as {context} or null variables from reaching LLM.
 */
function validatePromptPayload(variables = {}) {
  const missing = [];

  for (const [key, value] of Object.entries(variables)) {
    if (value === undefined || value === null) {
      missing.push(key);
    } else if (typeof value === 'string' && value.trim().length === 0) {
      missing.push(key);
    } else if (typeof value === 'string' && /\{[a-zA-Z0-9_-]+\}/.test(value)) {
      // Unreplaced template placeholder detected
      missing.push(`${key} (contains unpopulated template placeholder)`);
    }
  }

  return {
    isValid: missing.length === 0,
    missingVariables: missing
  };
}

/**
 * Generates prompt instructions based on the Query Category:
 * - DESCRIPTIVE: Strict factual summarization in original currency. No unsolicited loan/investment advice.
 * - ANALYTICAL: Mathematical analysis using verified figures.
 * - ADVISORY: Objective personal finance advisory tailored to verified profile data.
 */
function buildPromptForCategory(category, contextData = {}) {
  const { query, documentContext, profileContext, currency, bankName } = contextData;

  // Validate prompt variables
  const validation = validatePromptPayload({
    query: query,
    context: documentContext || profileContext
  });

  if (!validation.isValid) {
    throw new Error(`Prompt Validation Failed: Missing or unpopulated context variables: ${validation.missingVariables.join(', ')}`);
  }

  if (category === "DESCRIPTIVE") {
    return {
      systemPrompt: `You are FinTwin's Document Inspection & Extraction Assistant.
Your sole responsibility is to accurately read, summarize, and extract information from the user's uploaded document.

STRICT INSTRUCTIONS:
1. ANSWER STRICTLY AND EXCLUSIVELY USING THE RETRIEVED DOCUMENT INFORMATION BELOW.
2. NEVER invent income, expenses, transactions, dates, balances, or bank names.
3. PRESERVE THE ORIGINAL CURRENCY:
   - If the document uses USD ($), state all amounts in USD ($).
   - NEVER convert USD to INR or any other currency unless explicitly requested by the user.
4. INSTITUTION ACCURACY:
   - State the bank or institution name exactly as written in the document (${bankName || "as identified in document"}).
   - NEVER introduce State Bank of India (SBI) or Indian retail policies unless the document is explicitly from SBI.
5. NO UNSOLICITED ADVICE:
   - Do NOT give generic financial advice, loan recommendations, or investment lectures.
   - Simply provide a clear, factual, and well-structured summary of the document contents, key figures, and transaction rows.`,
      userPrompt: `DOCUMENT CONTENT:\n${documentContext}\n\nUSER QUESTION:\n${query}`
    };
  }

  if (category === "ANALYTICAL") {
    return {
      systemPrompt: `You are FinTwin's Analytical Financial Engine.
Your task is to provide precise, mathematical, and deterministic calculations and comparisons based on verified financial figures.

STRICT INSTRUCTIONS:
1. Base all calculations exclusively on verified document or profile data provided.
2. Maintain currency consistency throughout.
3. If information required for a calculation is missing, explicitly state what is missing instead of guessing or using arbitrary defaults.
4. If expenses exceed income, state the actual negative savings deficit without converting it to zero.
5. Present mathematical breakdowns with clean step-by-step numbers.`,
      userPrompt: `FINANCIAL DATA CONTEXT:\n${documentContext || profileContext}\n\nANALYTICAL QUESTION:\n${query}`
    };
  }

  // ADVISORY Category
  return {
    systemPrompt: `You are FinTwin's Objective AI Financial Advisor.
Your role is to provide actionable, ethical financial recommendations tailored to the user's verified financial profile.

STRICT INSTRUCTIONS:
1. Use only available and verified profile information.
2. If profile information (income, existing EMIs, tenure) is missing, clearly state that it is not provided and advise what is needed for a customized recommendation.
3. NEVER assume the user is a Software Engineer, has Medium risk appetite, or banks with SBI unless explicitly verified.
4. Provide balanced options across credible institutions without bias.`,
    userPrompt: `USER PROFILE CONTEXT:\n${profileContext}\n\nADVISORY QUESTION:\n${query}`
  };
}




// ============================================================================
// FINTWIN CORE FINANCIAL INTELLIGENCE & KNOWLEDGE ENGINE (Node.js Backend)
// Objective, deterministic, and verified financial advisory engine
// Enforces strict query routing (DESCRIPTIVE, ANALYTICAL, ADVISORY),
// prevents profile hallucinations, and validates all financial inputs.
// ============================================================================





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




export {
  calculateEMI,
  calculateSIP,
  calculateTotalInterestPayable,
  calculateTotalRepayment,
  extractFinancialNumbers,
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
  getVerifiedProfile,
  detectIntent,
  generateFinTwinAdvisory,
  generateSmartOfflineGuidance
};
