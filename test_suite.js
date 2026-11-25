const assert = require('assert');
const fs = require('fs');

// Import from backend/knowledgeEngine.js and financialValidator/documentEngine
const {
  calculateEMI,
  calculateSIP,
  calculateTotalInterestPayable,
  calculateTotalRepayment,
  extractFinancialNumbers,
  getVerifiedProfile,
  detectIntent,
  generateFinTwinAdvisory,
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
} = require('./backend/knowledgeEngine');

console.log("=================================================");
console.log("RUNNING FINTWIN ADVISOR TEST SUITE (COMPLETE AUDIT)");
console.log("=================================================\n");

let passedTests = 0;
let totalTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${testName}: ${err.message}`);
  }
}

// ----------------------------------------------------
// PREVIOUS SUITE: DETERMINISTIC EMI & SIP
// ----------------------------------------------------
runTest("EMI Calculation for ₹25 Lakhs at 8.5% for 20 years is mathematically exact", () => {
  const result = calculateEMI(2500000, 8.5, 20);
  assert(result !== null, "Result should not be null");
  assert.strictEqual(result.emi, 21696, `Expected EMI 21696, got ${result.emi}`);
  assert.strictEqual(result.principal, 2500000, "Principal should be 2500000");
  assert.strictEqual(result.totalPayment, 5207040, `Expected totalPayment 5207040, got ${result.totalPayment}`);
  assert.strictEqual(result.totalInterest, 2707040, `Expected totalInterest 2707040, got ${result.totalInterest}`);
  assert.strictEqual(result.tenureMonths, 240, "Tenure months should be 240");
});

runTest("EMI Calculation for ₹10 Lakhs at 10% for 1 year is mathematically exact", () => {
  const result = calculateEMI(1000000, 10, 1);
  assert(result !== null);
  assert.strictEqual(result.emi, 87916, `Expected EMI 87916, got ${result.emi}`);
  assert.strictEqual(result.totalPayment, 1054992, `Expected totalPayment 1054992, got ${result.totalPayment}`);
  assert.strictEqual(result.totalInterest, 54992, `Expected totalInterest 54992, got ${result.totalInterest}`);
});

runTest("Helper functions calculateTotalInterestPayable and calculateTotalRepayment are exact", () => {
  const emi = 87916;
  const tenureMonths = 12;
  const principal = 1000000;
  const totalRepay = calculateTotalRepayment(emi, tenureMonths);
  const totalInterest = calculateTotalInterestPayable(principal, emi, tenureMonths);
  assert.strictEqual(totalRepay, 1054992);
  assert.strictEqual(totalInterest, 54992);
});

runTest("SIP Calculation for ₹5,000 at 12% for 10 years is mathematically exact", () => {
  const result = calculateSIP(5000, 12, 10);
  assert(result !== null);
  assert.strictEqual(result.totalInvested, 600000, `Expected totalInvested 600000, got ${result.totalInvested}`);
  assert.strictEqual(result.futureValue, 1161695, `Expected futureValue 1161695, got ${result.futureValue}`);
  assert.strictEqual(result.estimatedReturns, 561695, `Expected estimatedReturns 561695, got ${result.estimatedReturns}`);
  assert.strictEqual(result.tenureMonths, 120);
});

runTest("EMI Calculation with missing inputs does not invent defaults and requests missing parameters", () => {
  const query = "Calculate EMI for 10 lakhs";
  const reply = generateFinTwinAdvisory(query, "", {});
  assert(reply.toLowerCase().includes("please provide the missing parameter(s)"), "Should request missing parameters");
  assert(reply.includes("Annual Interest Rate"), "Should mention missing interest rate");
  assert(reply.includes("Loan Tenure"), "Should mention missing tenure");
});

runTest("SIP Calculation with missing inputs does not invent defaults and requests missing parameters", () => {
  const query = "Calculate SIP";
  const reply = generateFinTwinAdvisory(query, "", {});
  assert(reply.toLowerCase().includes("please provide the missing parameter(s)"), "Should request missing parameters");
  assert(reply.includes("Monthly Investment Amount"), "Should mention missing investment amount");
  assert(reply.includes("Expected Annual Return Rate"), "Should mention missing return rate");
  assert(reply.includes("Investment Horizon / Tenure"), "Should mention missing tenure");
});

runTest("'What is SIP?' receives a direct definition without unsolicited simulation or recommendation", () => {
  const reply = generateFinTwinAdvisory("What is SIP?", "", {});
  assert(reply.includes("Understanding SIP (Systematic Investment Plan)"), "Should have SIP title");
  assert(reply.includes("Rupee Cost Averaging"), "Should explain Rupee Cost Averaging");
  assert(reply.includes("Power of Compounding"), "Should explain compounding");
  assert(!reply.includes("If you invest ₹5,000/month for 10 years at an expected 13% return"), "Must not contain unsolicited simulation");
});

runTest("'I want to apply for a loan' receives relevant loan application guidance", () => {
  const reply = generateFinTwinAdvisory("I want to apply for a loan", "State Bank of India", {});
  assert(reply.includes("How to Apply for a Loan: Step-by-Step Guide"), "Should guide on loan application");
  assert(reply.includes("Select the Appropriate Loan Category"), "Step 1: Loan category");
  assert(reply.includes("Organize Required Documentation"), "Step 3: Documentation");
});

runTest("KYC questions receive direct KYC explanation with required documents and verification modes", () => {
  const reply = generateFinTwinAdvisory("What is KYC?", "", {});
  assert(reply.includes("Understanding KYC (Know Your Customer)"), "Should explain KYC");
  assert(reply.includes("Officially Valid Documents (OVD)"), "Should list required documents");
  assert(reply.includes("PAN"), "Should mention PAN");
});

runTest("Chatbot avoids generic financial advice for unrelated questions", () => {
  const query = "What is the capital of France?";
  const reply = generateFinTwinAdvisory(query, "", {});
  assert(reply.includes("FinTwin AI Advisor Scope"), "Should explain advisor scope");
  assert(reply.includes("I can only answer financial and banking-related questions"), "Should state boundary politely");
});

runTest("SchemesPage.js and SchemesPage.css have 'myScheme ↗' removed from cards, 'View More ↗' in modal, and no tag overflow", () => {
  const schemesJs = fs.readFileSync('frontend/src/components/SchemesPage.js', 'utf8');
  const schemesCss = fs.readFileSync('frontend/src/components/SchemesPage.css', 'utf8');
  assert(!schemesJs.includes("className=\"scheme-btn-external\""), "scheme-btn-external must be removed");
  assert(!schemesJs.includes("myScheme ↗"), "myScheme ↗ must be removed from cards");
  assert(schemesJs.includes("View More ↗"), "Modal button must say View More ↗");
  assert(schemesJs.includes("categoryName: 'Micro-Business'"), "categoryName should be shortened");
  assert(schemesCss.includes("flex-wrap: wrap"), "scheme-card-header must have flex-wrap: wrap");
  assert(schemesCss.includes("white-space: normal"), "scheme-tag must allow wrapping");
});

// ----------------------------------------------------
// REQUIRED 10 SCENARIOS AUDIT TESTS
// ----------------------------------------------------

// TEST 1: Upload a USD bank statement and ask for a document summary.
// Expected: The AI summarizes the actual document in USD without unrelated financial advice.
runTest("TEST 1: Upload a USD bank statement and ask for a document summary in USD without unrelated advice", () => {
  const usdStatement = `
JPMorgan Chase Bank Statement
Account Number: 4589-XXXX-1122
Statement Period: January 1, 2024 to January 31, 2024
Currency: USD

Date,Description,Amount,Balance
2024-01-01,Opening Balance,$3200.00,$3200.00
2024-01-05,Payroll Direct Deposit,$4500.00,$7700.00
2024-01-12,Mortgage Payment,-$1850.00,$5850.00
2024-01-18,Utility Electric Bill,-$140.00,$5710.00
2024-01-31,Closing Balance,$5710.00,$5710.00
`;

  const category = classifyQuery("What does this document contain?", true);
  assert.strictEqual(category, "DESCRIPTIVE", "Query must be classified as DESCRIPTIVE");

  const reply = generateFinTwinAdvisory("What does this document contain?", "", {}, usdStatement);
  assert(reply.includes("JPMorgan Chase"), "Must mention JPMorgan Chase bank name");
  assert(reply.includes("USD") || reply.includes("$"), "Must preserve USD currency");
  assert(!reply.includes("₹"), "Must NOT convert USD figures to INR (₹)");
  assert(!reply.includes("State Bank of India"), "Must NOT invent State Bank of India");
  assert(!reply.includes("Sukanya Samriddhi"), "Must NOT provide unrelated Indian sovereign scheme advice");
  assert(!reply.includes("PPF"), "Must NOT provide unrelated PPF advice");
});

// TEST 2: Ask for monthly income when no income is available.
// Expected: "Income information not available." No invented values.
runTest("TEST 2: Ask for monthly income when no income is available returns 'Income information not available.'", () => {
  const emptyProfile = {};
  const reply = generateFinTwinAdvisory("What is my monthly income?", "", emptyProfile);
  assert.strictEqual(reply.trim(), "Income information not available.", "Must return exact message when income is missing");
  assert(!reply.includes("50,000"), "Must NOT invent default 50,000 income");
});

// TEST 3: Income = ₹10,00,000, Expenses = ₹50,000.
// Expected Savings = ₹9,50,000.
runTest("TEST 3: Income = ₹10,00,000, Expenses = ₹50,000 yields Expected Savings = ₹9,50,000", () => {
  const income = 1000000;
  const expenses = 50000;
  const calc = calculateSavings(income, expenses);
  assert.strictEqual(calc.savings, 950000, "Savings must equal exactly 950000");
  assert.strictEqual(calc.isDeficit, false, "Must not be a deficit");
  assert.strictEqual(calc.status, "SURPLUS");

  const profile = { monthlyIncome: income, monthlyExpenses: expenses };
  const reply = generateFinTwinAdvisory("Calculate my savings", "", profile);
  assert(reply.includes("9,50,000"), `Reply must state ₹9,50,000 savings: ${reply}`);
});

// TEST 4: Income = ₹10,00,000, Expenses = ₹50,00,00,000.
// Expected: Suspicious data detected and flagged. No misleading financial profile.
runTest("TEST 4: Income = ₹10,00,000, Expenses = ₹50,00,00,000 flags suspicious data anomaly", () => {
  const income = 1000000;       // 10 Lakhs
  const expenses = 500000000;   // 50 Crores (exceeds 3x income by 500x)
  const validation = validateFinancialValues(income, expenses);
  assert.strictEqual(validation.isSuspicious, true, "Expenses > 3x income must be flagged as suspicious");
  assert(validation.suspiciousReason.includes("exceed 3x reported income"), "Must give clear suspicious reason");

  const profile = { monthlyIncome: income, monthlyExpenses: expenses };
  const verified = getVerifiedProfile(profile);
  assert.strictEqual(verified.isSuspicious, true, "Profile must be flagged as suspicious");
  assert.strictEqual(verified.monthlySavings, null, "Savings must not be calculated as a misleading number");

  const reply = generateFinTwinAdvisory("Calculate my savings", "", profile);
  assert(reply.includes("Suspicious Data Detected"), "Advisory reply must clearly warn user about suspicious data");
});

// TEST 5: Upload a People's Trust Bank statement.
// Expected: The application must not invent SBI as the active bank.
runTest("TEST 5: Upload a People's Trust Bank statement must not invent SBI as active bank", () => {
  const statement = `
People's Trust Bank
Statement of Account
Customer Name: John Doe
Date,Description,Withdrawals,Deposits,Balance
2024-03-01,Opening Balance,,,1500.00
2024-03-05,Online Transfer,,500.00,2000.00
2024-03-10,ATM Withdrawal,100.00,,1900.00
`;

  const detectedBank = detectBankName(statement);
  assert.strictEqual(detectedBank, "People's Trust Bank", "Must detect People's Trust Bank");

  const reply = generateFinTwinAdvisory("What does this document contain?", "", {}, statement);
  assert(reply.includes("People's Trust Bank"), "Must state People's Trust Bank");
  assert(!reply.includes("State Bank of India"), "Must NOT invent State Bank of India");
  assert(!reply.includes("SBI"), "Must NOT mention SBI");
});

// TEST 6: Occupation and risk profile are not provided.
// Expected: Occupation: Not provided. Risk Profile: Not assessed.
runTest("TEST 6: Occupation and risk profile not provided default to 'Not provided' and 'Not assessed'", () => {
  const profile = { monthlyIncome: 60000 };
  const verified = getVerifiedProfile(profile);
  assert.strictEqual(verified.occupation, "Not provided", "Occupation must be 'Not provided' (not Software Engineer)");
  assert.strictEqual(verified.riskAppetite, "Not assessed", "Risk Profile must be 'Not assessed' (not Medium)");
  assert.strictEqual(verified.activeBank, "Not linked", "Active Bank must be 'Not linked' (not SBI)");

  const reply = generateFinTwinAdvisory("Show my financial profile", "", profile);
  assert(reply.includes("Occupation") && reply.includes("Not provided"), "Advisory must show Occupation: Not provided");
  assert(reply.includes("Risk Profile") && reply.includes("Not assessed"), "Advisory must show Risk Profile: Not assessed");
  assert(!reply.includes("Software Engineer"), "Must NOT assume Software Engineer");
});

// TEST 7: Income = ₹10,00,000, FOIR = 40%, Existing EMI = ₹50,000.
// Expected additional EMI capacity = ₹3,50,000.
runTest("TEST 7: Income = ₹10,00,000, FOIR = 40%, Existing EMI = ₹50,000 yields additional EMI capacity = ₹3,50,000", () => {
  const income = 1000000;
  const foirPercent = 40;
  const existingEmi = 50000;
  const foir = calculateFOIRCapacity(income, existingEmi, foirPercent);

  assert.strictEqual(foir.maxTotalEmi, 400000, "Max Total EMI at 40% of 10L must be 4,00,000");
  assert.strictEqual(foir.additionalCapacity, 350000, "Additional EMI capacity must be exactly 3,50,000");
  assert.strictEqual(foir.existingEmiProvided, true);

  // If existing EMI is missing, state it cannot be accurately determined
  const foirNoEmi = calculateFOIRCapacity(income, null, 40);
  assert.strictEqual(foirNoEmi.additionalCapacity, null);
  assert(foirNoEmi.message.includes("cannot be accurately determined"), "Must state additional capacity cannot be determined without current obligations");
});

// TEST 8: Create two different user sessions with different bank statements.
// Expected: No cross-user or cross-session data leakage.
runTest("TEST 8: Two user sessions with different bank statements have zero cross-user or cross-session data leakage", () => {
  const user1 = "alice@example.com";
  const user2 = "bob@example.com";

  const doc1 = `JPMorgan Chase Bank Statement\nBalance: $5,000.00\nAccount: Alice Checking`;
  const doc2 = `Citibank Account Statement\nBalance: $12,500.00\nAccount: Bob Savings`;

  // Ingest separately
  ingestUserDocument(user1, "doc_alice_01", doc1, "alice_chase.txt");
  ingestUserDocument(user2, "doc_bob_01", doc2, "bob_citi.txt");

  // Retrieve strictly for user1
  const retrievedUser1 = retrieveDocumentContext(user1, "doc_alice_01", "summary");
  assert(retrievedUser1.found === true);
  assert(retrievedUser1.text.includes("JPMorgan Chase"), "Alice must retrieve Chase Bank");
  assert(!retrievedUser1.text.includes("Citibank"), "Alice must NEVER retrieve Bob's Citibank statement");

  // Retrieve strictly for user2
  const retrievedUser2 = retrieveDocumentContext(user2, "doc_bob_01", "summary");
  assert(retrievedUser2.found === true);
  assert(retrievedUser2.text.includes("Citibank"), "Bob must retrieve Citibank");
  assert(!retrievedUser2.text.includes("JPMorgan Chase"), "Bob must NEVER retrieve Alice's Chase statement");

  // User 1 cannot retrieve User 2's documentId
  const crossLeakAttempt = retrieveDocumentContext(user1, "doc_bob_01", "summary");
  assert(!crossLeakAttempt.text.includes("Citibank"), "Cross-user retrieval attempt must return empty/isolated content");
});

// TEST 9: Send an incomplete prompt with a missing context variable.
// Expected: Prompt validation catches the issue before the LLM API call.
runTest("TEST 9: Incomplete prompt with missing context variable is caught by prompt validation before LLM call", () => {
  const incompletePayload = {
    query: "What is my balance?",
    context: "" // Empty context variable
  };

  const validation = validatePromptPayload(incompletePayload);
  assert.strictEqual(validation.isValid, false, "Must detect invalid/empty context variable");
  assert(validation.missingVariables.includes("context"), "Must flag context as missing");

  // Check template placeholder failure
  const placeholderPayload = {
    query: "What is my balance?",
    context: "Document details: {context}" // Unfilled template placeholder
  };
  const validation2 = validatePromptPayload(placeholderPayload);
  assert.strictEqual(validation2.isValid, false, "Must detect unfilled {context} placeholder");

  // Verify buildPromptForCategory throws validation error
  assert.throws(() => {
    buildPromptForCategory("DESCRIPTIVE", { query: "", documentContext: "" });
  }, /Prompt Validation Failed/, "Should throw prompt validation error");
});

// TEST 10: Ask an advisory question.
// Expected: Financial advice is generated using only available and validated financial information, with missing information clearly disclosed.
runTest("TEST 10: Advisory question generates advice using only available validated information with missing info disclosed", () => {
  const incompleteProfile = { monthlyIncome: 50000 };
  const verified = getVerifiedProfile(incompleteProfile);
  assert.strictEqual(verified.hasIncome, true);
  assert.strictEqual(verified.occupation, "Not provided");
  assert.strictEqual(verified.riskAppetite, "Not assessed");

  const reply = generateFinTwinAdvisory("Where should I invest my money?", "", incompleteProfile);
  assert(reply.includes("Financial Advisory Guidance") || reply.includes("Investment Roadmap"), "Should provide financial advisory");
  assert(reply.includes("Emergency Reserves First") || reply.includes("Safety"), "Should prioritize safety & reserves");
  assert(reply.includes("₹50,000"), "Should reference verified income");
  assert(!reply.includes("Software Engineer"), "Must not invent occupation");
  assert(!reply.includes("State Bank of India"), "Must not assume SBI");
});

console.log("\n=================================================");
console.log(`TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
console.log("=================================================");

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
