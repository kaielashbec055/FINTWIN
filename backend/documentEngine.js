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

module.exports = {
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
