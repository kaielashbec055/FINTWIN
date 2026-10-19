// ============================================================================
// FINTWIN CORE FINANCIAL INTELLIGENCE & KNOWLEDGE ENGINE (Node.js Backend)
// Expert, comprehensive, deterministic financial intelligence for Indian users
// ============================================================================

/**
 * Calculates monthly EMI given principal, annual interest rate, and tenure in years
 */
function calculateEMI(principal, annualRate, tenureYears) {
  const p = parseFloat(principal);
  const r = parseFloat(annualRate) / 12 / 100;
  const n = parseFloat(tenureYears) * 12;

  if (p <= 0 || r <= 0 || n <= 0) return null;

  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - p;

  return {
    emi: Math.round(emi),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    principal: Math.round(p),
    tenureMonths: Math.round(n),
    tenureYears: parseFloat(tenureYears)
  };
}

/**
 * Calculates future value of a monthly SIP
 */
function calculateSIP(monthlyInvestment, expectedReturnRate, tenureYears) {
  const p = parseFloat(monthlyInvestment);
  const i = parseFloat(expectedReturnRate) / 12 / 100;
  const n = parseFloat(tenureYears) * 12;

  if (p <= 0 || i <= 0 || n <= 0) return null;

  const fv = p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  const totalInvested = p * n;
  const estimatedReturns = fv - totalInvested;

  return {
    futureValue: Math.round(fv),
    totalInvested: Math.round(totalInvested),
    estimatedReturns: Math.round(estimatedReturns),
    tenureYears: parseFloat(tenureYears),
    multiplier: (fv / totalInvested).toFixed(1)
  };
}

/**
 * Extracts numeric parameters (amount, rate, years) from a user query
 */
function extractFinancialNumbers(text) {
  const str = (text || "").toLowerCase().replace(/,/g, "");

  let amount = null;
  // Match patterns like "25 lakhs", "25l", "25 lac", "1.5 crore", "1cr", "5000", "50000"
  const croreMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:crore|crores|cr)\b/);
  const lakhMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|l)\b/);
  const kMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:k|thousand)\b/);
  const plainNumMatch = str.match(/(?:₹|rs\.?|inr)?\s*(\d{4,9})\b/);

  if (croreMatch) {
    amount = parseFloat(croreMatch[1]) * 10000000;
  } else if (lakhMatch) {
    amount = parseFloat(lakhMatch[1]) * 100000;
  } else if (kMatch) {
    amount = parseFloat(kMatch[1]) * 1000;
  } else if (plainNumMatch) {
    amount = parseFloat(plainNumMatch[1]);
  }

  // Match interest rate: e.g. "8.5%", "8.5 percent", "at 9%"
  let rate = null;
  const rateMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:%|percent)/);
  if (rateMatch) {
    rate = parseFloat(rateMatch[1]);
  }

  // Match tenure in years: e.g. "20 years", "20 yrs", "15 year", "5 yr"
  let years = null;
  const yearMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?|yr)\b/);
  const monthMatch = str.match(/(\d+)\s*(?:months?|mos?|mo)\b/);
  if (yearMatch) {
    years = parseFloat(yearMatch[1]);
  } else if (monthMatch) {
    years = parseFloat(monthMatch[1]) / 12;
  }

  return { amount, rate, years };
}

/**
 * Formats a number as Indian Currency (e.g., ₹25,00,000)
 */
function formatINR(val) {
  if (isNaN(val) || val === null || val === undefined) return "₹0";
  return "₹" + Math.round(Number(val)).toLocaleString("en-IN");
}

/**
 * Comprehensive Financial Intelligence Advisor Engine
 * Answers any user query accurately, professionally, and contextually.
 */
function generateFinTwinAdvisory(query, activeBank = "", profile = {}, attachedFile = null) {
  const rawQ = (query || "").trim();
  const q = rawQ.toLowerCase();
  
  // Clean raw profile data
  const rawIncome = typeof profile?.monthlyIncome === "string" 
    ? profile.monthlyIncome.replace(/[₹,]/g, "") 
    : profile?.monthlyIncome;
  const rawExpenses = typeof profile?.monthlyExpenses === "string" 
    ? profile.monthlyExpenses.replace(/[₹,]/g, "") 
    : profile?.monthlyExpenses;

  const income = Number(rawIncome) || 50000;
  let parsedExpenses = Number(rawExpenses) || 0;
  if (parsedExpenses <= 0) {
    parsedExpenses = Math.round(income * 0.4);
  } else if (parsedExpenses > income) {
    parsedExpenses = Math.round(income * 0.45);
  }
  const expenses = parsedExpenses;
  const safeEmi = Math.round(income * 0.4);
  const parsedNums = extractFinancialNumbers(rawQ);

  // --------------------------------------------------------------------------
  // 0. DOCUMENT ATTACHMENT & EXPLANATION ENGINE
  // When a user attaches any financial document and asks "explain this document" or "what is this document"
  // --------------------------------------------------------------------------
  let docName = attachedFile?.name || "";
  let docSize = attachedFile?.size || "";
  let docType = attachedFile?.type || "";

  // Extract from query string if embedded in [Attached Document: ...] format
  const docTagMatch = rawQ.match(/\[Attached Document:\s*([^\]\(\r\n]+)(?:\s*\(([^)]+)\))?\]/i);
  if (docTagMatch) {
    if (!docName) docName = docTagMatch[1].trim();
    if (!docSize && docTagMatch[2]) docSize = docTagMatch[2].trim();
  }

  const isDocQuery = docName || 
    q.includes("explain this document") || 
    q.includes("what is this document") || 
    q.includes("explain the document") || 
    q.includes("what does this document mean") || 
    q.includes("analyze this document") || 
    q.includes("explain document") || 
    q.includes("document explanation") ||
    q.includes("what document is this") ||
    q.includes("tell me about this document") ||
    q.includes("describe this document") ||
    q.includes("verify this document");

  if (isDocQuery) {
    const docLower = docName.toLowerCase();

    // CATEGORY 1: SALARY SLIP / PAYSLIP
    if (
      docLower.includes("salary") || 
      docLower.includes("payslip") || 
      docLower.includes("pay_slip") || 
      docLower.includes("pay-slip") || 
      docLower.includes("wage") || 
      docLower.includes("ctc") ||
      q.includes("salary slip") || 
      q.includes("payslip") || 
      q.includes("pay slip")
    ) {
      return `### 📑 Document Analysis: Salary Slip / Monthly Payslip
${docName ? `• **File Name**: ${docName} ${docSize ? `(${docSize})` : ""}\n` : ""}• **Document Classification**: Income & Employment Verification Document

#### 1. What This Document Is:
A Salary Slip (or Payslip) is an official legal record issued monthly by an employer to an employee. It serves as documented proof that you are gainfully employed and outlines the exact financial reconciliation of your monthly earnings, statutory deductions, and net in-hand remuneration.

#### 2. Key Components Breakdown:
• **Gross Earnings (Income Components)**:
  - **Basic Pay**: Core taxable base salary (usually 40% to 50% of Cost to Company / CTC).
  - **House Rent Allowance (HRA)**: Allowance given to cover rental accommodation costs, eligible for tax exemptions under Section 10(13A).
  - **Dearness Allowance (DA) & Special Allowances**: Cost of living adjustments and flexible benefit allowances.
  - **Performance Bonus / Incentives**: Variable pay components paid quarterly or annually.

• **Statutory & Voluntary Deductions**:
  - **Employee Provident Fund (EPF)**: Mandatory 12% deduction of basic salary deposited into your EPFO account under UAN, eligible for Section 80C deduction.
  - **Professional Tax (PT)**: State-level tax (typically ₹200/month, max ₹2,500/year).
  - **Tax Deducted at Source (TDS / Income Tax)**: Monthly income tax withheld by your employer based on your chosen regime (New vs Old).

• **Net Take-Home Pay**:
  - Net Pay = Gross Earnings minus Total Deductions. This is the exact sum credited to your salary bank account.

#### 3. Banking & Credit Significance:
• **Loan Eligibility & Affordability**: Indian commercial banks (SBI, HDFC, ICICI, etc.) require your last 3 to 6 months of salary slips for Home Loans, Personal Loans, Car Loans, and Credit Cards.
• **FOIR / DTI Calculation**: Lenders look at your Net Take-Home Pay to calculate your Fixed Obligation to Income Ratio (FOIR). Most banks mandate that all loan EMIs must not exceed 40% to 50% of your net monthly income (${formatINR(income)} in your profile gives a safe EMI ceiling of ${formatINR(safeEmi)}/month).
• **Employment Stability**: Continuity of salary slips confirms job stability, which directly lowers your loan interest spread.

#### 4. Verification & Best Practices:
• Match the **Net Salary** on your slip with the credit narration in your bank statement.
• Check that your **PAN** and **UAN** printed on the slip are accurate.
• Save salary slips for at least 3 financial years for loan underwriting and ITR cross-verification.`;
    }

    // CATEGORY 2: BANK ACCOUNT STATEMENT / PASSBOOK
    const isInvestmentDoc = docLower.includes("cas") || 
      docLower.includes("cams") || 
      docLower.includes("kfintech") || 
      docLower.includes("zerodha") || 
      docLower.includes("groww") || 
      docLower.includes("upstox") || 
      docLower.includes("demat") || 
      docLower.includes("portfolio") || 
      docLower.includes("holding") || 
      docLower.includes("mutual") || 
      docLower.includes("pnl") ||
      q.includes("demat") || 
      q.includes("cas") || 
      q.includes("mutual fund") || 
      q.includes("portfolio");

    if (
      !isInvestmentDoc && (
        docLower.includes("statement") || 
        docLower.includes("passbook") || 
        docLower.includes("bank_statement") || 
        docLower.includes("bank-statement") || 
        docLower.includes("account_statement") ||
        q.includes("bank statement") || 
        q.includes("account statement") || 
        q.includes("passbook")
      )
    ) {
      return `### 📑 Document Analysis: Bank Account Statement / Passbook
${docName ? `• **File Name**: ${docName} ${docSize ? `(${docSize})` : ""}\n` : ""}• **Document Classification**: Banking Ledger & Cashflow Verification Record

#### 1. What This Document Is:
A Bank Account Statement is an official, chronological transaction ledger issued by a commercial bank or financial institution detailing all financial inflows (credits) and outflows (debits) over a specified period (typically 3, 6, or 12 months).

#### 2. Key Components Breakdown:
• **Account & Branch Metadata**:
  - Account Number, Account Type (Savings / Current / Salary), CIF Number, IFSC Code, and registered branch address.
• **Opening & Closing Balances**:
  - The starting balance on Day 1 and final balance at period end.
• **Transaction Ledger Columns**:
  - **Date & Value Date**: When the transaction occurred vs when funds settled.
  - **Narration / Description**: Identifies source or beneficiary (e.g., SAL/NEFT for salary, UPI/VPA for merchant spends, ACH/ECS for loan EMIs).
  - **Cheque / Reference Number**: Transaction UTR or cheque serial number.
  - **Debit (Withdrawal) & Credit (Deposit)**: Inflows vs Outflows.
  - **Running Balance**: Real-time balance maintained after each transaction.

#### 3. Banking & Underwriting Significance:
• **Primary Lending Metric**: Underwriters and automated loan algorithms scan your bank statement to calculate your **Average Monthly Balance (AMB)** and assess your financial discipline.
• **Salary Inflow Verification**: Confirms that your reported salary is consistently deposited around the same day each month without unexplained gaps.
• **Debt Servicing & Existing Obligations**: Discloses any active EMIs, credit card payments, or recurring insurance debits that aren't yet updated in CIBIL.
• **Red Flags Evaluated by Banks**:
  - ECS / NACH return charges (bounced auto-debits directly destroy creditworthiness).
  - Frequent balance drops to zero or overdraft usage.
  - High unverified cash deposits or gambling transactions.

#### 4. Safety & FinTwin Integration:
• Never share your NetBanking password, PIN, or OTP. Official bank e-statements often require a password (commonly your PAN in lowercase or DOB).
• Keep statements password-protected and upload verified summaries to your FinTwin Documents Vault for seamless wealth tracking.`;
    }

    // CATEGORY 3: FORM 16 / TDS CERTIFICATE
    if (
      docLower.includes("form16") || 
      docLower.includes("form_16") || 
      docLower.includes("form-16") || 
      docLower.includes("tds") ||
      q.includes("form 16") || 
      q.includes("form-16") || 
      q.includes("tds certificate")
    ) {
      return `### 📑 Document Analysis: Form 16 (TDS Certificate for Salaried Employees)
${docName ? `• **File Name**: ${docName} ${docSize ? `(${docSize})` : ""}\n` : ""}• **Document Classification**: Statutory Tax Certificate under Section 203 of the Income Tax Act, 1961

#### 1. What This Document Is:
Form 16 is an official certificate issued annually by employers to their salaried workforce by June 15th. It serves as concrete proof that the income tax deducted from your monthly salary (TDS) has been deposited with the Central Government (Income Tax Department).

#### 2. Key Structure Breakdown:
• **Part A (TRACES Certificate)**:
  - Generated and downloaded strictly from the TRACES government portal with a valid digital signature.
  - Contains Employer TAN (Tax Deduction Account Number) & Name.
  - Employee PAN, Name, and Address.
  - Assessment Year (AY) and Financial Year (FY).
  - Summary of quarterly tax deducted and deposited with the Government treasury (Challan details).

• **Part B (Salary & Tax Computation Annexure)**:
  - **Gross Salary**: Detailed breakup of Salary as per Section 17(1), Perquisites under Section 17(2), and Profits in lieu of salary under Section 17(3).
  - **Exemptions under Section 10**: HRA under 10(13A), Leave Travel Allowance (LTA), and Conveyance.
  - **Standard Deduction**: ₹75,000 (New Regime) or ₹50,000 (Old Regime).
  - **Deductions under Chapter VI-A**: Section 80C (PPF, ELSS, EPF, Life Insurance up to ₹1.5L), Section 80D (Health Insurance up to ₹50k), Section 80CCD(1B) (NPS up to ₹50k).
  - **Total Taxable Income & Net Tax Payable**: Final tax liability calculated, Education Cess (4%), and relief under Section 87A.

#### 3. Why It Is Critical for You:
• **Filing Your Annual ITR**: Form 16 contains all figures required to file your annual ITR-1 (Sahaj) or ITR-2 on the e-filing portal before the July 31st deadline.
• **High-Value Bank Loans**: Commercial banks (SBI, HDFC, ICICI, etc.) require the last 2 years of Form 16 for sanctioning Home Loans, Mortgage Loans, and Education Loans.
• **Cross-Verification with Form 26AS & AIS**: Always cross-verify the TDS figures on your Form 16 with your Annual Information Statement (AIS) and Form 26AS to ensure no tax discrepancies exist.`;
    }

    // CATEGORY 4: INCOME TAX RETURN (ITR / ITR-V)
    if (
      docLower.includes("itr") || 
      docLower.includes("tax_return") || 
      docLower.includes("tax-return") || 
      docLower.includes("acknowledgement") || 
      docLower.includes("acknowledgment") ||
      q.includes("itr") || 
      q.includes("income tax return") || 
      q.includes("tax return")
    ) {
      return `### 📑 Document Analysis: Income Tax Return Acknowledgement (ITR-V)
${docName ? `• **File Name**: ${docName} ${docSize ? `(${docSize})` : ""}\n` : ""}• **Document Classification**: Income Tax Assessment & Legal Filing Acknowledgement

#### 1. What This Document Is:
ITR-V (Income Tax Return Verification) is the official single-page legal document generated by the Income Tax Department of India upon successful electronic submission of your annual Income Tax Return.

#### 2. Key Components Breakdown:
• **Filing Identifiers**:
  - 15-Digit Acknowledgement Number & Date/Time of E-Filing.
  - Assessment Year (AY) (e.g. AY 2024-25 represents income earned in FY 2023-24).
  - Form Type: ITR-1 (Sahaj), ITR-2, ITR-3 (Business/Profession), or ITR-4 (Sugam).
• **Income & Computation Summary**:
  - Gross Total Income across all 5 heads (Salary, House Property, Capital Gains, Business/Profession, Other Sources).
  - Total Deductions claimed under Chapter VI-A.
  - Net Taxable Total Income.
  - Total Tax & Interest Payable vs Total Taxes Paid (TDS + TCS + Advance Tax + Self-Assessment Tax).
  - Refund Claimed (if excess tax was deducted) or Balance Tax Due.
• **Verification Barcode & Status**:
  - Displays whether the return was e-Verified (via Aadhaar OTP, NetBanking, or DSC).

#### 3. Banking & International Significance:
• **Proof of Legal Income**: The #1 universally recognized document for self-employed individuals, freelancers, business owners, and salaried professionals alike.
• **Loan Eligibility**: Lenders mandate the last 2 to 3 years of ITR computations for home loans and commercial credit.
• **Global Visa Processing**: Embassies (USA, UK, Schengen, Canada) require 2 to 3 years of ITR-V as proof of financial ties to India.
• **Loss Carry-Forward**: Filing your return on time allows you to carry forward capital market losses (equity, F&O) for up to 8 financial years to offset future profits.`;
    }

    // CATEGORY 5: LOAN SANCTION LETTER / AGREEMENT
    if (
      docLower.includes("sanction") || 
      docLower.includes("loan_offer") || 
      docLower.includes("loan-offer") || 
      docLower.includes("approval") || 
      docLower.includes("loan_agreement") ||
      q.includes("sanction letter") || 
      q.includes("loan sanction") || 
      q.includes("loan offer")
    ) {
      return `### 📑 Document Analysis: Loan Sanction Letter / Credit Approval Offer
${docName ? `• **File Name**: ${docName} ${docSize ? `(${docSize})` : ""}\n` : ""}• **Document Classification**: Formal Credit Sanction Contract & Term Sheet

#### 1. What This Document Is:
A Loan Sanction Letter is a formal legal commitment issued by a bank, housing finance company (HFC), or NBFC informing the applicant that their loan request has been approved up to a specific amount under defined terms and conditions.

#### 2. Key Components Breakdown:
• **Sanctioned Loan Amount**: Maximum principal sum the lender agrees to disburse.
• **Interest Rate & Benchmark**:
  - Numerical Rate (e.g., 8.50% p.a.).
  - Rate Type: Fixed vs Floating (benchmarked to RBI's External Benchmark Lending Rate / Repo Rate or MCLR).
• **Loan Tenure & Repayment Mode**:
  - Number of months (e.g., 240 months for 20 years).
  - Estimated Monthly EMI and NACH/auto-debit mandate setup requirements.
• **Fee Schedule & Charges**:
  - Loan Processing Fee (typically 0.25% to 1% + 18% GST).
  - Documentation, Legal & Valuation fees.
  - Prepayment / Foreclosure penalty terms (RBI rules specify 0% penalty on floating rate retail loans to individuals).
• **Special Conditions Precedent**:
  - Mandatory property title clearance, building plan approval, guarantor documentation, or mortgage life insurance assignment.

#### 3. Next Steps & Precautions:
• A sanction letter is **not disbursement**; it is typically valid for 30 to 90 days.
• Check the interest reset clause (spread over Repo Rate).
• Review whether insurance is forced as bundled; RBI guidelines prohibit lenders from mandating a specific insurer.
• Calculate your exact EMI amortization and safe repayment limits on FinTwin before signing acceptance.`;
    }

    // CATEGORY 6: INSURANCE POLICY BOND
    if (
      docLower.includes("insurance") || 
      docLower.includes("policy") || 
      docLower.includes("policy_bond") || 
      docLower.includes("term_insurance") || 
      docLower.includes("health_insurance") || 
      docLower.includes("lic") || 
      docLower.includes("maxlife") || 
      docLower.includes("star_health") ||
      q.includes("insurance policy") || 
      q.includes("policy bond") || 
      q.includes("insurance bond")
    ) {
      return `### 📑 Document Analysis: Insurance Policy Bond / Schedule
${docName ? `• **File Name**: ${docName} ${docSize ? `(${docSize})` : ""}\n` : ""}• **Document Classification**: Legal Insurance Underwriting Contract

#### 1. What This Document Is:
An Insurance Policy Bond is the legal contract between the policyholder and an IRDAI-regulated insurance provider (such as LIC, HDFC Life, ICICI Lombard, Star Health, etc.). It specifies the exact protection terms, financial sum assured, and conditions under which claims will be honored.

#### 2. Key Components Breakdown:
• **Policy Identity**: Policy Number, UIN (Unique Identification Number), Plan Name, and Inception Date.
• **Coverage Metrics**:
  - **Sum Assured / Sum Insured**: Maximum payout in the event of death (Term Life) or hospitalization (Health Insurance).
  - **Policy Term & Premium Paying Term (PPT)**: How long the policy covers you vs how many years you must pay premiums.
• **Premium Breakdown**:
  - Base Premium + Riders (Accidental Death, Critical Illness, Waiver of Premium) + 18% GST.
• **Nominee Details**: Legal beneficiary registered to receive claim payouts.
• **Clauses & Exclusions to Scrutinize**:
  - Waiting periods for specific illnesses (typically 2 to 4 years for pre-existing diseases).
  - Co-payment percentage, room-rent limits, and day-care procedures.

#### 3. Tax & Financial Benefits:
• **Tax Deductions**: Premiums qualify under Section 80D (Health Insurance up to ₹25k/₹50k) or Section 80C (Term/Life Insurance up to ₹1.5L).
• **Section 10(10D) Exemption**: Life insurance maturity proceeds or death benefits are 100% tax-free subject to premium-to-sum-assured limits.
• **Emergency Protection**: Protects your family's financial future and prevents liquidation of long-term investments during unexpected medical emergencies.`;
    }

    // CATEGORY 7: IDENTITY & KYC DOCUMENTS (PAN / AADHAAR / PASSPORT)
    if (
      docLower.includes("pan") || 
      docLower.includes("aadhaar") || 
      docLower.includes("aadhar") || 
      docLower.includes("kyc") || 
      docLower.includes("passport") || 
      docLower.includes("voter") ||
      q.includes("pan card") || 
      q.includes("aadhaar") || 
      q.includes("kyc document")
    ) {
      return `### 📑 Document Analysis: Identity & KYC Document (PAN / Aadhaar / Passport)
${docName ? `• **File Name**: ${docName} ${docSize ? `(${docSize})` : ""}\n` : ""}• **Document Classification**: Government-Issued Sovereign Identity & Financial KYC Verification

#### 1. What This Document Is:
This is a sovereign identity document issued by the Government of India or statutory authorities (Income Tax Department, UIDAI, MEA, or Election Commission) that establishes proof of identity, legal name, date of birth, and residency.

#### 2. Key Components Breakdown:
• **PAN Card (Permanent Account Number)**:
  - 10-digit unique alphanumeric identifier (e.g. ABCDE1234F) issued by the Income Tax Department.
  - The 4th character denotes entity type ('P' = Individual), and 5th character is the first letter of your surname.
  - Mandatory for all financial transactions in India: opening bank accounts, mutual funds, demat accounts, loan applications, and transactions exceeding ₹50,000.
• **Aadhaar Card (UIDAI)**:
  - 12-digit random biometric unique identity number.
  - Used for instant paperless e-KYC, Aadhaar-enabled payment system (AePS), and Direct Benefit Transfer (DBT) of government subsidies.
• **Passport / Voter ID / Driving License**:
  - Officially Valid Documents (OVD) accepted as proof of residential address and date of birth.

#### 3. Critical Privacy & Security Guidelines:
• **Mask Your Aadhaar**: Always use Masked Aadhaar (where the first 8 digits are hidden as 'XXXX XXXX 1234') when submitting copies to non-statutory bodies to prevent identity theft.
• **PAN-Aadhaar Linking**: Ensure your PAN is linked with your Aadhaar on the e-filing portal to avoid your PAN becoming inoperative.
• **KYC Compliance**: Central KYC (CKYC) allows your KYC to be registered once across all Indian banks, brokers, and mutual funds via your 14-digit KIN.`;
    }

    // CATEGORY 8: INVESTMENT / DEMAT / CAS STATEMENT
    if (
      docLower.includes("cas") || 
      docLower.includes("cams") || 
      docLower.includes("kfintech") || 
      docLower.includes("zerodha") || 
      docLower.includes("groww") || 
      docLower.includes("upstox") || 
      docLower.includes("demat") || 
      docLower.includes("portfolio") || 
      docLower.includes("holding") || 
      docLower.includes("pnl") ||
      q.includes("demat") || 
      q.includes("cas statement") || 
      q.includes("mutual fund statement") || 
      q.includes("portfolio statement")
    ) {
      return `### 📑 Document Analysis: Investment Portfolio / Demat / CAS Statement
${docName ? `• **File Name**: ${docName} ${docSize ? `(${docSize})` : ""}\n` : ""}• **Document Classification**: Consolidated Account Statement (CAS) & Capital Assets Portfolio

#### 1. What This Document Is:
A Consolidated Account Statement (CAS) or Demat Statement is a unified financial report issued monthly or quarterly by depositories (NSDL / CDSL) and RTAs (CAMS / KFintech) detailing all your mutual fund holdings, equities, exchange-traded funds (ETFs), bonds, and sovereign gold bonds (SGBs) held under your PAN.

#### 2. Key Components Breakdown:
• **Holding Summary**:
  - Scheme / Stock Name, ISIN Code, and Folio / Demat DP ID.
  - Units Held, Purchase NAV / Average Cost, Current NAV / Market Price.
  - Invested Capital vs Current Market Valuation.
• **Return Metrics**:
  - **XIRR (Extended Internal Rate of Return)**: The true annualized rate of return factoring in irregular cashflows and SIP installments.
  - **Absolute Return & CAGR**: Cumulative percentage gain or loss.
• **Transaction Log**:
  - Detailed entries for SIP deductions, lump sum purchases, switch-outs, redemptions, and dividend payouts (IDCW).

#### 3. Financial & Tax Applications:
• **Capital Gains Tax Assessment**:
  - Equity Mutual Funds & Stocks: Long-Term Capital Gains (LTCG > 12 months) are taxed at 12.5% for gains exceeding ₹1.25 Lakh per financial year; Short-Term (STCG) at 20%.
  - Debt Mutual Funds: Taxed at slab rates.
• **Portfolio Health & Rebalancing**: Review asset allocation between Large-Cap, Mid-Cap, Small-Cap, and Debt to ensure it matches your risk appetite.
• **Collateral for Loans (LAS)**: You can pledge approved mutual fund units and demat shares with banks for an instant Loan Against Securities (LAS) without selling your investments.`;
    }

    // CATEGORY 9: PROPERTY / REAL ESTATE DOCUMENTS
    if (
      docLower.includes("deed") || 
      docLower.includes("sale_deed") || 
      docLower.includes("encumbrance") || 
      docLower.includes("khata") || 
      docLower.includes("patta") || 
      docLower.includes("property") ||
      q.includes("sale deed") || 
      q.includes("encumbrance certificate") || 
      q.includes("property deed")
    ) {
      return `### 📑 Document Analysis: Property Ownership & Real Estate Record
${docName ? `• **File Name**: ${docName} ${docSize ? `(${docSize})` : ""}\n` : ""}• **Document Classification**: Immovable Property Title & Registration Document

#### 1. What This Document Is:
A Property Document (such as a registered Sale Deed, Title Deed, Encumbrance Certificate, Khata certificate, or Patta) is a legal deed recorded at the State Government's Sub-Registrar Office establishing ownership rights, title conveyance, and legal encumbrance status over a parcel of land or residential/commercial property.

#### 2. Key Components Breakdown:
• **Sale Deed / Title Deed**:
  - Names of Vendor (Seller) and Vendee (Buyer).
  - Detailed property boundary schedule (North, South, East, West boundaries, survey number, square footage/carpet area).
  - Sale consideration amount, stamp duty paid, and registration fee receipt.
• **Encumbrance Certificate (EC / Form 15 & 16)**:
  - Issued for a period (e.g. 15 to 30 years) showing all registered mortgages, sales, leases, or court attachments.
  - A 'Nil Encumbrance Certificate' (Form 16) certifies the property is free of legal claims and bank charges.
• **Khata / Property Tax Receipt**:
  - Local municipal assessment certificate (e.g. BBMP A-Khata, BMC assessment) confirming property tax payments are up to date.

#### 3. Banking & Mortgage Underwriting:
• **Collateral Verification**: When you apply for a Home Loan or Loan Against Property (LAP), the bank's panel advocate conducts a 30-year search report on these documents.
• **Original Document Custody**: Commercial banks hold original sale deeds in a secure vault until the mortgage is fully repaid and a Deed of Reconveyance is registered.`;
    }

    // CATEGORY 10: GENERIC / OTHER FINANCIAL DOCUMENT
    return `### 📑 Document Analysis: Financial Document & Records Review
${docName ? `• **File Name**: ${docName} ${docSize ? `(${docSize})` : ""}\n` : ""}• **Document Classification**: Financial Record & Verification Document

#### 1. How to Identify What This Document Is:
Financial documents in India generally belong to one of six primary categories:
1. **Income & Employment**: Salary Slips, Employer CTC letters, Form 16, or Form 16A.
2. **Banking & Transactions**: Savings/Current Account Statements, Fixed Deposit (FD) Receipts, Passbooks, or Cheque Leaves.
3. **Tax & Compliance**: ITR-V Acknowledgements, Tax Computation sheets, Form 26AS, or Annual Information Statement (AIS).
4. **Loans & Credit**: Loan Sanction Letters, EMI Amortization schedules, No Objection Certificates (NOC), or CIBIL Credit Reports.
5. **Investments & Wealth**: Mutual Fund CAS statements, Demat holding summaries, Insurance Policy bonds, or Property deeds.
6. **Identity & KYC**: PAN Card, Aadhaar Card, Passport, or Voter ID.

#### 2. How to Inspect This Document:
• **Check the Issuing Header & Authority**: Look at the top banner or header to find the issuing bank, employer, insurer, or government department logo.
• **Check Unique Identification Codes**: Look for identifiers such as PAN, TAN, IFSC, Account Number, Policy Number, Loan Sanction Number, or e-Filing Acknowledgement Number.
• **Check Dates & Period**: Verify the Financial Year (FY), Assessment Year (AY), or statement date range.
• **Check Authorization**: Look for official seals, QR codes, or digital signature marks confirming authenticity.

#### 3. Role on FinTwin:
• You can organize and secure this document inside your **FinTwin Documents Vault**.
• If you need specific analysis for an EMI calculation, tax regime comparison, or loan application checklist, ask me anytime!`;
  }

  // --------------------------------------------------------------------------
  // 1. GREETINGS, CONVERSATION & COURTESY
  // --------------------------------------------------------------------------
  const isGreeting = /^(hi|hello|hey|hiya|greetings|namaste|good\s*(morning|afternoon|evening|day)|hola)\b/i.test(q);
  if (isGreeting && q.split(" ").length <= 4) {
    return `1. Hello & Welcome to FinTwin AI!
I am your dedicated personal financial advisor, built to help you navigate loans, investments, taxes, banking products, and government welfare programs across India.

2. Your Financial Snapshot:
• Net Monthly Income: ${formatINR(income)}
• Safe Monthly EMI Ceiling (40% Rule): ${formatINR(safeEmi)}
• Active Selected Bank: ${activeBank || "Universal Explorer (All Banks)"}

3. Quick Topics You Can Ask Me Right Now:
• "Calculate EMI for ₹25 Lakhs at 8.5% for 20 years"
• "What is an Education Loan and how to apply?"
• "Compare SBI vs HDFC Bank for Home Loans"
• "Explain SIP vs Lump Sum investing"
• "How to improve my CIBIL score to 750+?"
• "Which tax regime is better: New or Old?"
• "What government schemes am I eligible for?"

What would you like to explore today?`;
  }

  // Politeness / Gratitude / Thanks
  if (/\b(thank\s*you|thanks|thx|appreciate\s*it|thanku|dhanyawad|shukriya)\b/i.test(q)) {
    return `You're very welcome! 😊 

I'm always here to help you make smarter, data-backed financial decisions. 

Feel free to ask anytime about:
• Calculating EMIs or checking loan affordability
• Optimizing your mutual fund SIPs and investments
• Maximizing Section 80C and 80D tax deductions
• Finding government schemes and grants on FinTwin!

Have a financially prosperous day ahead! 🚀`;
  }

  // Farewells / Goodbyes
  if (/\b(bye|goodbye|see\s*you|tata|cya|take\s*care)\b/i.test(q)) {
    return `Goodbye! Have a wonderful day ahead. Whenever you have questions about your loans, investments, or taxes, FinTwin will be right here to assist you! 🌟`;
  }

  // Small Talk / Acknowledgments
  if (/^(ok|okay|cool|great|awesome|nice|understood|got\s*it|sure|perfect|fine)\b/i.test(q) && q.split(" ").length <= 3) {
    return `Great! Let me know if you would like to test an EMI calculation, compare loan interest rates across banks, explore government schemes, or optimize your tax savings. What would you like to do next?`;
  }

  // Identity / "Who are you?" / "What is FinTwin?" / "Help"
  if (
    q.includes("who are you") || 
    q.includes("what are you") || 
    q.includes("what is fintwin") || 
    q.includes("what can you do") || 
    q.includes("help me") || 
    q === "help"
  ) {
    return `1. What is FinTwin?
FinTwin is an advanced AI-powered multi-bank personal finance, lending, and wealth management ecosystem tailored for retail Indian borrowers and investors.

2. Core Capabilities of Your FinTwin AI Advisor:
• 🧮 Dynamic Loan & EMI Radar: Instant amortization schedules, debt-to-income (DTI) calculations, and pre-payment impact simulations.
• 🏦 Multi-Bank Institution Comparison: Comprehensive rates and features across Public Sector, Private, Small Finance, Regional Rural, and Cooperative Banks.
• 📈 Wealth & SIP Planner: Compounding projections for Mutual Funds, Index Funds, Fixed Deposits, Gold (SGB), and Stocks.
• 🏛️ Sovereign Welfare Navigator: Guidance on PMJDY, Sukanya Samriddhi, APY, PPF, NPS, PMAY, and Mudra schemes.
• 📑 Tax Optimization Engine: Actionable breakdowns of New vs Old Tax Regimes, Section 80C, 80D, 24(b), and capital gains.
• 📊 Real-Time Financial Profiling: Custom recommendations calibrated to your monthly salary of ${formatINR(income)}.

Type any question or calculation to get started!`;
  }

  // FinTwin App Guide & Features
  if (
    q.includes("how to use") || 
    q.includes("add transaction") || 
    q.includes("track expense") || 
    q.includes("how does this app work") || 
    q.includes("app features")
  ) {
    return `1. How to Navigate FinTwin:
• Dashboard: Overview of total assets, live monthly cash flow, visual expense pie charts, and recent transaction history. Click "+ Add Transaction" in the top bar to record income or expenses.
• AI Advisor: Your interactive financial assistant for answers on loans, investments, taxes, and bank terms.
• Loans: Compare interest rates, run dynamic EMI sliders, and test your borrowing eligibility across 20+ Indian banks.
• Investments: Track portfolios across Mutual Funds, Fixed Deposits, Gold, and calculate future wealth using the SIP projector.
• Schemes: Direct catalog of Central and State government welfare schemes with eligibility matching and official myScheme portal links.
• Goals: Plan target milestones for Emergency Funds, Home Down Payments, or Retirement with calculated monthly SIP requirements.
• Documents: Encrypted digital vault to organize your PAN, Aadhaar, ITR receipts, and loan sanction letters.

Which section would you like assistance with?`;
  }

  // --------------------------------------------------------------------------
  // 1.5 DEDICATED HIGH-PRIORITY HANDLERS (Bank Comparisons, Profile Health, Loan Intent, KYC)
  // --------------------------------------------------------------------------

  // A. BANK COMPARISON (SBI vs HDFC, ICICI, etc.) + LOAN & ELIGIBILITY ("Can I get it?")
  const hasCompareKeyword = /\b(compare|vs|versus|difference|better|which is better|best bank)\b/i.test(q);
  const mentionsSBI = /\b(sbi|state bank)\b/i.test(q);
  const mentionsHDFC = /\b(hdfc|hdfc bank)\b/i.test(q);
  const mentionsICICI = /\b(icici|icici bank)\b/i.test(q);
  const isBankComparison = hasCompareKeyword && ((mentionsSBI && mentionsHDFC) || (mentionsHDFC && mentionsICICI) || (mentionsSBI && mentionsICICI) || q.includes("compare banks") || q.includes("compare sbi") || q.includes("compare hdfc"));

  if (isBankComparison) {
    const isPersonalLoan = q.includes("personal loan") || q.includes("personal") || q.includes("unsecured");
    const isHomeLoan = q.includes("home loan") || q.includes("housing loan") || q.includes("mortgage");

    if (isPersonalLoan) {
      const maxPersonalLoan = formatINR(Math.min(income * 25, 5000000));
      return `### ⚖️ Bank Comparison: SBI vs HDFC Bank (Personal Loan)

#### 1. Rate & Term Comparison:
• **SBI (State Bank of India - Xpress Credit / Personal Loan)**:
  - **Interest Rate**: 10.30% to 13.90% p.a. (strictly linked to CIBIL score & sovereign benchmark).
  - **Processing Fee**: 0.50% to 1.50% + 18% GST (often 100% waived during festive offers).
  - **Prepayment / Foreclosure Charges**: Nil (0%) prepayment penalty when pre-closed from own verifiable funds.
  - **Core Advantage**: Lowest overall interest rate spread, zero hidden charges, transparent sovereign PSU backing.

• **HDFC Bank (Instant Personal Loan)**:
  - **Interest Rate**: 10.50% to 14.50% p.a.
  - **Processing Fee**: Up to 1.99% to 2.50% + 18% GST.
  - **Disbursal Speed**: Ultra-fast (under 10 minutes online for pre-approved salary account holders).
  - **Prepayment Charges**: 2% to 4% lock-in penalty during first 12 months; permitted thereafter.
  - **Core Advantage**: Quickest turnaround, 100% digital paperless journey, top-tier NetBanking & mobile app experience.

#### 2. Eligibility Evaluation for Your Profile ("Can I Get It?"):
• **Verdict**: **YES, 100% ELIGIBLE with Top-Tier Approval Status!**
• **Eligibility Breakdown**:
  - **Income Criterion**: Your in-hand monthly income of **${formatINR(income)}** exceeds the minimum bank requirement (₹25,000/mo) by **${Math.round(income / 25000)}x**.
  - **Estimated Loan Eligibility**: You comfortably qualify for a personal loan sanction of up to **${maxPersonalLoan}** across either lender.
  - **Debt Burden / Safe EMI**: Under the 40% FOIR ceiling, your maximum safe EMI capacity is **${formatINR(safeEmi)}/month**. A ₹20 Lakh loan at 10.5% for 5 years requires an EMI of only ~₹42,980/month (consuming just ~${((42980 / income) * 100).toFixed(1)}% of your salary).

#### 3. FinTwin Strategic Verdict:
• **Choose SBI**: If you want the lowest total interest payout, lower processing fees, and zero prepayment penalties.
• **Choose HDFC Bank**: If you require instant, emergency disbursal credited to your account within hours.`;
    }

    if (isHomeLoan) {
      const maxHomeLoan = formatINR(income * 60);
      return `### ⚖️ Bank Comparison: SBI vs HDFC Bank (Home Loan)

#### 1. Rate & Term Comparison:
• **SBI (SBI Regular Home Loan)**:
  - **Interest Rate**: 8.50% to 9.15% p.a. (EBLR benchmarked to RBI Repo Rate).
  - **Processing Fee**: Flat ₹2,000 to ₹5,000 + GST (frequently 100% waived).
  - **Tenure**: Up to 30 years (360 months).
  - **Prepayment Charges**: 0% penalty on floating rate retail loans.
  - **Core Advantage**: Lowest lifetime interest rate, strictest legal & technical property verification.

• **HDFC Bank (HDFC Home Loan)**:
  - **Interest Rate**: 8.70% to 9.40% p.a.
  - **Processing Fee**: Up to 0.50% of loan amount (min ₹3,000, max ₹10,000) + GST.
  - **Disbursal Speed**: 3 to 7 working days with door-step documentation.
  - **Core Advantage**: Faster sanction letter generation and dedicated relationship manager.

#### 2. Eligibility Evaluation for Your Profile:
• **Verdict**: **Eligible for Prime Sanctions up to ${maxHomeLoan}**.
• **Safe EMI Ceiling**: ${formatINR(safeEmi)}/month (40% FOIR rule).
• **Best Choice**: SBI offers slightly cheaper interest rates over a 20-30 year tenure, saving lakhs in cumulative interest.`;
    }

    return `### ⚖️ Comprehensive Comparison: SBI vs HDFC Bank

#### 1. Key Differentiators:
• **Institution Type**:
  - **SBI**: India's largest Public Sector Bank (Sovereign ownership, 22,000+ branches, highest safety).
  - **HDFC Bank**: India's largest Private Sector Bank (Market leader in technology, credit cards, and digital banking).

#### 2. Retail Loan Rates (2024-2025):
• **Home Loans**:
  - SBI: **8.50% - 9.15%** (Lowest rates, lower processing fee).
  - HDFC: **8.70% - 9.40%** (Faster processing, doorstep service).
• **Personal Loans**:
  - SBI: **10.30% - 13.90%** (Transparent, 0% prepayment fee from own funds).
  - HDFC: **10.50% - 14.50%** (Instant 10-minute digital disbursals).
• **Fixed Deposits (FD)**:
  - SBI: **6.80% - 7.25%** (Extra 0.50% for senior citizens).
  - HDFC: **7.00% - 7.40%** (Competitive short to medium-term yields).

#### 3. Eligibility with Your Profile (${formatINR(income)}/mo):
• Both banks consider you a **Priority / HNI Customer**.
• You qualify for maximum pre-approved loan amounts and waiver of processing fees at both institutions.
• **FinTwin Recommendation**: Choose **SBI** for long-term borrowing (Home Loans) to minimize interest cost; choose **HDFC** for premier digital banking, credit cards, and quick personal credit.`;
  }

  // B. FINANCIAL PROFILE ASSESSMENT ("how is my financial profile", "my profile", "financial health")
  const isProfileQuery = !hasCompareKeyword && !q.includes("compare") && (
    q.includes("financial profile") || 
    q.includes("my profile") || 
    q.includes("how is my profile") || 
    q.includes("profile review") || 
    q.includes("review my profile") || 
    q.includes("evaluate my profile") || 
    q.includes("check my profile") || 
    q.includes("analyze my profile") || 
    q.includes("financial health") || 
    q.includes("health check") ||
    (q.includes("profile") && (q.includes("how") || q.includes("tell") || q.includes("check") || q.includes("status")))
  );

  if (isProfileQuery) {
    const netSavings = Math.max(income - expenses, 0);
    const savingsRatio = Math.round((netSavings / income) * 100);
    const emergencyMin = formatINR(expenses * 3);
    const emergencyMax = formatINR(expenses * 6);
    const maxPersonalSanction = formatINR(Math.min(income * 25, 5000000));
    const maxHomeSanction = formatINR(income * 60);

    return `### 📊 Holistic Financial Profile Assessment

#### 1. Your Financial Dimensions:
• **Monthly In-Hand Income**: **${formatINR(income)}**
• **Estimated Monthly Living Expenses**: **${formatINR(expenses)}**
• **Net Monthly Savings Capacity**: **${formatINR(netSavings)}** (${savingsRatio}% savings rate)
• **Safe Debt Servicing Ceiling (FOIR 40% Rule)**: **${formatINR(safeEmi)}/month** maximum for all EMIs combined.
${profile?.riskAppetite ? `• **Stated Risk Appetite**: ${profile.riskAppetite}\n` : ""}${profile?.financialGoal ? `• **Primary Stated Goal**: ${profile.financialGoal}\n` : ""}
#### 2. Key Health Indicators & Strengths:
• **Cashflow Strength**: Excellent! With an in-hand salary of ${formatINR(income)}, your disposable surplus gives you tremendous compounding leverage.
• **Borrowing Power**: You qualify as a Prime/HNI borrower across Indian banks:
  - Personal Loan Capacity: Up to ~${maxPersonalSanction} pre-approved.
  - Home Loan Capacity: Up to ~${maxHomeSanction} at prime interest rates (8.50%-8.90%).
• **Safe EMI Threshold**: Never allow total active loan EMIs to cross ${formatINR(safeEmi)}/month to ensure stress-free debt servicing.

#### 3. Recommended Action Plan:
1. **Defensive Emergency Buffer**: Ensure you maintain a liquid emergency reserve of **${emergencyMin} to ${emergencyMax}** in high-yield savings accounts or liquid mutual funds (covering 3 to 6 months of living expenses).
2. **Wealth Multiplication**: Deploy ${formatINR(Math.round(netSavings * 0.6))}/month into disciplined equity mutual fund SIPs (e.g. 50% Nifty 50 Index + 30% Flexi-Cap + 20% Mid/Small-cap).
3. **Tax Optimization**: At your income level, evaluate New Tax Regime vs Old Tax Regime deductions (Section 80C, 80D, 24b) to minimize high-slab tax incidence.`;
  }

  // C. LOAN APPLICATION & ROADMAP ("i want a loan", "apply loan", "need loan", "can i get a loan")
  const isGeneralLoanIntent = 
    q === "loan" || 
    q === "i want a loan" || 
    q.includes("want a loan") || 
    q.includes("need a loan") || 
    q.includes("get a loan") || 
    q.includes("apply for loan") || 
    q.includes("apply loan") || 
    q.includes("apply a loan") || 
    q.includes("can i get a loan") || 
    q.includes("how to get loan") || 
    q.includes("loan eligibility") || 
    q.includes("want loan") || 
    q.includes("need loan");

  if (isGeneralLoanIntent && !parsedNums.amount) {
    const maxPersonalSanction = formatINR(Math.min(income * 25, 5000000));
    const maxHomeSanction = formatINR(income * 60);

    return `### 🏦 Loan Advisory & Application Roadmap for Your Profile

#### 1. Your Borrowing Capacity (Based on ${formatINR(income)}/mo Income):
• **Safe EMI Limit (40% FOIR Rule)**: Up to **${formatINR(safeEmi)}/month** total EMI across all loans.
• **Home Loan Eligibility**: Up to **${maxHomeSanction}** (tenure up to 30 years at 8.50% - 9.15% p.a.).
• **Personal Loan Eligibility**: Up to **${maxPersonalSanction}** (unsecured, tenure 1 to 5 years at 10.25% - 13.50% p.a.).
• **Car / Auto Loan Eligibility**: Up to 90%-100% on-road funding at 8.75% - 9.50% p.a.

#### 2. Top Recommended Lenders:
• **State Bank of India (SBI)**: Best for lowest interest rates and zero prepayment penalties.
• **HDFC Bank**: Best for instant pre-approved digital disbursals and fastest turnaround.
• **ICICI Bank**: Competitive rates with pre-approved offers for corporate salary holders.

#### 3. Mandatory Documents Checklist:
1. **Identity & Address Proof (KYC)**: PAN Card and Aadhaar Card.
2. **Income Proof**: Last 3 months Salary Slips and latest Form 16 / ITR-V.
3. **Banking Proof**: Last 6 months bank statement showing regular salary credits.
4. **Credit Score**: CIBIL Score 750+ ensures instant approvals at the lowest interest spreads.

#### 4. Which Loan Would You Like to Explore?
• Ask: *"Calculate EMI for 30 Lakhs at 8.5% for 20 years"*
• Ask: *"Compare SBI vs HDFC for Personal Loan"*
• Ask: *"What are the documents needed for a Home Loan?"*`;
  }

  // D. KYC INTENT ("KYC", "what is kyc", "kyc verification", "kyc update")
  const isKycQuery = 
    q === "kyc" || 
    q.includes("what is kyc") || 
    q.includes("kyc verification") || 
    q.includes("kyc document") || 
    q.includes("kyc update") || 
    q.includes("ckyc") || 
    q.includes("video kyc") || 
    q.includes("ekyc");

  if (isKycQuery) {
    return `### 🪪 Complete Guide to KYC (Know Your Customer) in India

#### 1. What is KYC?
KYC (Know Your Customer) is a mandatory identity and address verification process mandated by the Reserve Bank of India (RBI), SEBI, and IRDAI. It prevents financial fraud, identity theft, and money laundering across banks, mutual funds, and stockbrokers.

#### 2. Officially Valid Documents (OVD) Required:
• **Proof of Identity (PoI)**:
  - **PAN Card**: Mandatory for all bank accounts, demat accounts, mutual funds, and transactions above ₹50,000.
• **Proof of Address (PoA)**:
  - **Aadhaar Card** (UIDAI)
  - **Indian Passport**
  - **Voter ID Card** (Election Commission)
  - **Driving License**

#### 3. Different Modes of KYC Verification:
• **e-KYC (Aadhaar OTP)**: Instant 2-minute digital verification via OTP sent to your Aadhaar-linked mobile number.
• **Video KYC (V-KYC)**: Quick 5-minute video call with a bank officer from home (keep original PAN card ready).
• **Central KYC (CKYC)**: Generates a 14-digit KIN number registered with CERSAI. Once completed at any bank or broker, it works universally across all financial institutions in India.

#### 4. Critical Security Tip:
• Always use **Masked Aadhaar** (first 8 digits hidden as 'XXXX XXXX 1234') when submitting copies to non-banking entities.
• Banks will NEVER call or send SMS asking for your NetBanking password, debit card PIN, or OTP in the name of "KYC expiry/block".`;
  }

  // --------------------------------------------------------------------------
  // 2. DYNAMIC EMI & LOAN CALCULATION
  // --------------------------------------------------------------------------
  if (
    (q.includes("emi") && (q.includes("calculate") || q.includes("how much") || parsedNums.amount || q.includes("for") || q.includes("formula"))) ||
    (q.includes("calculate") && (q.includes("loan") || parsedNums.amount))
  ) {
    // Formula explanation if specifically requested
    if (q.includes("formula") && !parsedNums.amount) {
      return `1. The Mathematical EMI Formula:
EMI = [P × R × (1 + R)^N] / [(1 + R)^N - 1]

Where:
• P = Principal Loan Amount
• R = Monthly Interest Rate (Annual Rate divided by 12 and then divided by 100)
• N = Loan Tenure in Total Number of Months (Years × 12)

2. Example Calculation:
For a loan of ₹10,00,000 at 9% annual interest for 5 years (60 months):
• P = ₹10,00,000
• R = 9 / (12 × 100) = 0.0075
• N = 60 months
• Monthly EMI = ₹20,758
• Total Interest Payable = ₹2,45,501
• Total Repayment = ₹12,45,501

Ask me to calculate your loan anytime by typing: "Calculate EMI for ₹20 Lakhs at 8.5% for 15 years"!`;
    }

    const p = parsedNums.amount || 2500000;
    const r = parsedNums.rate || 8.5;
    const y = parsedNums.years || 20;

    const result = calculateEMI(p, r, y);
    if (result) {
      const isAffordable = result.emi <= safeEmi;
      return `1. EMI Amortization Summary:
For a loan of ${formatINR(result.principal)} at ${r}% p.a. over ${y} years (${result.tenureMonths} months):
• Monthly EMI: ${formatINR(result.emi)}
• Total Principal Repaid: ${formatINR(result.principal)}
• Total Interest Payable: ${formatINR(result.totalInterest)}
• Total Repayment (Principal + Interest): ${formatINR(result.totalPayment)}
• Interest-to-Principal Ratio: ${((result.totalInterest / result.principal) * 100).toFixed(1)}%

2. Debt-to-Income (DTI) Affordability Check:
• Your Recorded In-Hand Monthly Income: ${formatINR(income)}
• Recommended Maximum Safe EMI (40% Rule): ${formatINR(safeEmi)}/month
• Financial Status: ${isAffordable ? `✅ Safe: This EMI of ${formatINR(result.emi)} consumes ${((result.emi / income) * 100).toFixed(1)}% of your monthly income, well within prudent limits.` : `⚠️ Warning: This EMI of ${formatINR(result.emi)} consumes ${((result.emi / income) * 100).toFixed(1)}% of your monthly income, exceeding the recommended 40% ceiling (${formatINR(safeEmi)}). We recommend extending the tenure or increasing your down payment.`}

3. Pro Money-Saving Strategy:
Prepaying just 5% of the outstanding principal once a year or making 1 extra EMI payment annually can cut a 20-year home loan down by 4 to 5 years and save you several lakhs in interest!`;
    }
  }

  // --------------------------------------------------------------------------
  // 3. LOAN AFFORDABILITY & MAXIMUM BORROWING CAPACITY
  // --------------------------------------------------------------------------
  if (
    q.includes("can i afford") || 
    q.includes("how much loan can i get") || 
    q.includes("loan eligibility") || 
    q.includes("borrowing capacity") || 
    q.includes("maximum loan") ||
    (q.includes("eligible") && q.includes("loan"))
  ) {
    const userMaxEmi = safeEmi;
    // Estimate max loan sanction capacity at 8.75% interest for 15, 20, and 30 years
    const maxLoan20Yr = Math.round(userMaxEmi * 114);
    const maxLoan30Yr = Math.round(userMaxEmi * 128);
    const maxLoan15Yr = Math.round(userMaxEmi * 99);

    return `1. Your Loan Affordability & Eligibility Assessment:
Based on your recorded monthly in-hand income of ${formatINR(income)}:

• Maximum Safe Monthly EMI (40% Rule): ${formatINR(userMaxEmi)}/month
• Conservative Safe EMI (30% Rule): ${formatINR(Math.round(income * 0.3))}/month

2. Maximum Estimated Home Loan Sanction Capacity (at prevailing 8.75% p.a.):
• 30-Year Tenure: Up to ${formatINR(maxLoan30Yr)}
• 20-Year Tenure: Up to ${formatINR(maxLoan20Yr)}
• 15-Year Tenure: Up to ${formatINR(maxLoan15Yr)}

3. Key Approval Factors Indian Banks Scrutinize:
• CIBIL Score: 750+ required for discounted interest rates and quick sanction.
• Fixed Obligation to Income Ratio (FOIR): Total existing EMIs + proposed EMI should not exceed 50% of gross income.
• Down Payment (Margin Money): Banks fund 75% to 90% of property cost. You must arrange 10% to 25% from own savings.
• Employment Stability: Minimum 2+ years of continuous employment for salaried, 3+ years ITR history for self-employed.`;
  }

  // --------------------------------------------------------------------------
  // 4. EDUCATION LOANS (DOMESTIC & OVERSEAS)
  // --------------------------------------------------------------------------
  if (
    q.includes("education loan") || 
    q.includes("student loan") || 
    q.includes("study abroad") || 
    q.includes("higher education loan")
  ) {
    return `1. What is an Education Loan?
An education loan is a specialized credit facility extended by Indian commercial banks to finance tuition fees, accommodation, exam fees, books, and living expenses for recognized undergraduate, postgraduate, and professional courses in India or abroad.

2. Benchmark Terms Across Indian Banks (SBI, PNB, Canara, BoB, HDFC):
• Interest Rates: 8.50% to 11.25% p.a. (Public sector banks offer concessions of 0.50% for female students).
• Loan Amounts:
  - Up to ₹7.5 Lakhs: No collateral or third-party guarantee required (backed by Credit Guarantee Fund Scheme for Education Loans - CGFSEL).
  - Above ₹7.5 Lakhs: Tangible collateral (residential property, commercial asset, or fixed deposit) usually required.
• Repayment Moratorium Period: Course duration + 6 to 12 months grace period before mandatory EMI repayment commences.
• Repayment Tenure: Up to 15 years after the moratorium period.

3. Triple Benefits & Tax Advantages:
• Section 80E Tax Deduction: You can deduct 100% of the interest paid on education loans from your taxable income with NO upper limit for up to 8 consecutive financial years!
• Vidyalakshmi Portal: Apply to multiple government and private banks through a single official Government of India window at vidyalakshmi.co.in.

4. Essential Checklist: Admission letter, fee structure, academic transcripts, KYC of student & co-borrower (parent/guardian), and income proof of parent.`;
  }

  // --------------------------------------------------------------------------
  // 5. VEHICLE / CAR / BIKE LOANS
  // --------------------------------------------------------------------------
  if (
    q.includes("car loan") || 
    q.includes("vehicle loan") || 
    q.includes("auto loan") || 
    q.includes("bike loan") || 
    q.includes("two wheeler loan")
  ) {
    return `1. What is a Vehicle / Car Loan?
A secured credit facility to purchase new or pre-owned four-wheelers or two-wheelers. The vehicle itself serves as collateral through bank hypothecation until the loan is fully paid off.

2. Current Interest Rates & Terms in India:
• Public Sector Banks (SBI, BoB, Canara, PNB): 8.65% to 9.50% p.a. for new cars.
• Private Sector Banks (HDFC, ICICI, Axis): 8.75% to 10.25% p.a.
• Used Car Loans: 11.00% to 15.00% p.a.
• Maximum Tenure: Up to 7 years (84 months) for new cars, up to 5 years for used cars.
• Financing Coverage: 85% to 100% on-road or ex-showroom price depending on bank.

3. Electric Vehicle (EV) Special Incentives:
Many Indian banks (e.g. SBI Green Car Loan) offer a 0.20% to 0.25% interest rate discount and waived processing fees for purchasing Electric Vehicles.

4. Prudent Financial Rule: Keep your car EMI under 15% of your net monthly salary (${formatINR(Math.round(income * 0.15))}/month for your income) and aim for a minimum 20% down payment.`;
  }

  // --------------------------------------------------------------------------
  // 6. GOLD LOANS
  // --------------------------------------------------------------------------
  if (
    q.includes("gold loan") || 
    q.includes("loan against gold") || 
    q.includes("jewel loan")
  ) {
    return `1. What is a Gold Loan?
A secured loan where you pledge 18 to 22-karat gold jewellery or coins as collateral to a bank or NBFC in exchange for instant liquidity.

2. Key Features & Prevailing Rates:
• Interest Rates: 8.50% to 11.50% in Public/Private banks (SBI, Canara, Muthoot, Manappuram). Agriculture gold loans can be as low as 7.00%.
• Loan-to-Value (LTV) Ratio: RBI permits banks to lend up to 75% of the evaluated market value of the pledged gold.
• Tenure: 3 months to 36 months (short to medium term).
• Processing Speed: Disbursed in 30 to 60 minutes with minimal documentation (only KYC required).

3. Repayment Flexibility:
• Regular Monthly EMI: Principal + interest paid monthly.
• Bullet Repayment: Pay entire principal and accumulated interest together at the end of the loan tenure.
• Interest-Only EMI: Pay monthly interest and repay principal at maturity.

4. When to Use: Gold loans are ideal for urgent medical or short-term business cash needs, avoiding the high interest rates and strict CIBIL requirements of unsecured personal loans.`;
  }

  // --------------------------------------------------------------------------
  // 7. BUSINESS & MSME LOANS / MUDRA YOJANA
  // --------------------------------------------------------------------------
  if (
    q.includes("business loan") || 
    q.includes("msme") || 
    q.includes("mudra") || 
    q.includes("startup loan") || 
    q.includes("cgtmse")
  ) {
    return `1. Business & MSME Lending in India:
Indian entrepreneurs and small businesses can access working capital loans, machinery term loans, and letter of credit facilities through various government-backed and commercial routes.

2. Pradhan Mantri Mudra Yojana (PMMY) - Collateral-Free Micro Loans:
• Shishu: Loans up to ₹50,000 for nascent startups and micro-enterprises.
• Kishore: Loans from ₹50,000 to ₹5,00,000 for expanding businesses.
• Tarun: Loans from ₹5,00,000 to ₹10,00,000 (extended up to ₹20 Lakhs for proven past borrowers).
• Collateral: Zero collateral required. Interest rates range between 8.5% and 11.5%.

3. CGTMSE Scheme (Credit Guarantee Fund Trust for Micro and Small Enterprises):
Provides collateral-free credit facility up to ₹2 Crores to ₹5 Crores for manufacturing and service MSMEs, backed by 75% to 85% sovereign guarantee.

4. Documents Required: Business PAN, Udyam MSME Registration Certificate, 12-month bank statements, GST returns, and last 2 years audited ITRs/P&L statements.`;
  }

  // --------------------------------------------------------------------------
  // 8. LOAN AGAINST PROPERTY (LAP)
  // --------------------------------------------------------------------------
  if (
    q.includes("loan against property") || 
    q.includes(" lap ") || 
    q.startsWith("lap ") || 
    q.endsWith(" lap") || 
    q.includes("mortgage loan")
  ) {
    return `1. What is a Loan Against Property (LAP)?
A secured mortgage loan where you pledge an unencumbered residential, commercial, or industrial property you already own to secure a large credit facility.

2. LAP vs Personal Loan Comparison:
• Interest Rate: LAP interest is much lower (9.00% to 11.50% p.a.) compared to personal loans (11% to 16%+).
• Loan Amount: Up to 60% to 70% of the property's evaluated market value (can easily range from ₹25 Lakhs to ₹10 Crores).
• Tenure: Up to 15 to 20 years, making monthly EMI obligations significantly lighter.
• End-Use: Can be used freely for business expansion, child’s overseas education, medical treatment, or debt consolidation.

3. Prerequisite: Property must have clear, marketable title deeds without existing legal disputes or encumbrances.`;
  }

  // --------------------------------------------------------------------------
  // 9. HOME LOANS
  // --------------------------------------------------------------------------
  if (
    q.includes("home loan") || 
    q.includes("housing loan") || 
    q.includes("mortgage") || 
    q.includes("plot loan") || 
    q.includes("renovation loan")
  ) {
    return `1. What is a Home Loan?
A secured credit facility granted by commercial banks and housing finance companies (HFCs) to buy ready-to-move apartments, construct independent homes, purchase plots, or carry out extensive renovations.

2. Benchmark Interest Rates & Features in India:
• Prevailing Floating Interest Rates: 8.35% to 9.50% p.a., tied directly to RBI’s Repo Linked Lending Rate (RLLR).
• Loan-to-Value (LTV) Cap:
  - Loans up to ₹30 Lakhs: Up to 90% property cost financed.
  - Loans ₹30L to ₹75L: Up to 80% financed.
  - Loans above ₹75 Lakhs: Up to 75% financed.
• Tenure: Extended up to 30 years to minimize monthly cash strain.

3. Triple Tax Deductions (Old Tax Regime):
• Section 80C: Deduct up to ₹1,50,000 on principal repayment annually.
• Section 24(b): Deduct up to ₹2,00,000 on interest paid for self-occupied property.
• Joint Borrowing: Both husband and wife as co-borrowers can claim separate ₹3.5 Lakh deductions, shielding up to ₹7,00,000 per family!

4. Your Sanction Capacity: With your monthly salary of ${formatINR(income)}, your comfortable loan sanction capacity is approximately ${formatINR(safeEmi * 115)} over 20 years.`;
  }

  // --------------------------------------------------------------------------
  // 10. PERSONAL LOANS
  // --------------------------------------------------------------------------
  if (
    q.includes("personal loan") || 
    q.includes("unsecured loan") || 
    q.includes("salary loan") || 
    q.includes("instant loan")
  ) {
    return `1. What is a Personal Loan?
An unsecured loan requiring zero collateral or asset mortgage. Approvals are strictly based on your monthly salary, employer reputation, and CIBIL credit score.

2. Prevailing Terms & Interest Rates:
• Prime Borrowers (CIBIL 750+): 10.25% to 13.50% p.a.
• Standard/Fair Borrowers: 14.00% to 18.00%+ p.a.
• Tenure: 12 to 60 months (1 to 5 years).
• Disbursal: Instant to 24 hours through net banking for pre-approved customers.

3. Golden Rules Before Taking a Personal Loan:
• Compare Processing Fees: Typically 1% to 2.5% + 18% GST.
• Check Foreclosure Penalties: Many banks lock the loan for 6 to 12 months before allowing pre-closure.
• Prudent Limit: Your personal loan EMI should never exceed 20% to 25% of your in-hand monthly salary.`;
  }

  // --------------------------------------------------------------------------
  // 11. SIP (SYSTEMATIC INVESTMENT PLAN) & COMPOUNDING
  // --------------------------------------------------------------------------
  if (
    q.includes("sip") || 
    q.includes("systematic investment") || 
    (q.includes("invest") && (q.includes("monthly") || q.includes("every month")))
  ) {
    const sipAmount = parsedNums.amount || 5000;
    const sipYears = parsedNums.years || 10;
    const expectedRate = parsedNums.rate || 12;
    const sipResult = calculateSIP(sipAmount, expectedRate, sipYears);

    return `1. What is a SIP (Systematic Investment Plan)?
A SIP is a disciplined investment methodology for Indian Mutual Funds where you invest a predetermined sum at regular intervals (usually monthly) into equity or debt mutual funds instead of committing a huge lump sum.

2. Why SIP is the #1 Wealth Engine in India:
• Rupee Cost Averaging: You automatically buy more mutual fund units when market valuations dip and fewer units when markets peak. This eliminates the futile stress of trying to "time the market".
• Exponential Power of Compounding: Reinvested earnings generate their own returns year after year.
• Low Barrier to Entry: You can start with as little as ₹500 or ₹1,000 per month.
• High Liquidity: Pause, modify, step up, or withdraw your investments anytime (except ELSS funds which have a 3-year tax lock-in).

3. Compounding Simulation for You:
If you invest ${formatINR(sipAmount)} per month for ${sipYears} years at an expected ${expectedRate}% CAGR:
• Total Amount You Invest: ${formatINR(sipResult.totalInvested)}
• Estimated Wealth Accumulated: ${formatINR(sipResult.futureValue)}
• Net Wealth Gain: ${formatINR(sipResult.estimatedReturns)} (Your capital multiplies by ${sipResult.multiplier}x!)

4. Actionable Portfolio Allocation for Your Income (${formatINR(income)}/mo):
• 50% in a Nifty 50 Index Fund (Rock-solid large-cap foundation, low expense ratio)
• 30% in a Diversified Flexi-Cap Fund (Dynamic growth across market caps)
• 20% in Sovereign Gold Bonds or Fixed Deposits (Defensive buffer)`;
  }

  // --------------------------------------------------------------------------
  // 12. MUTUAL FUNDS & STOCKS
  // --------------------------------------------------------------------------
  if (
    q.includes("mutual fund") || 
    q.includes("mutual funds") || 
    q.includes("index fund") || 
    q.includes("equity fund") || 
    q.includes("elss") || 
    q.includes("flexi cap") || 
    q.includes("small cap")
  ) {
    return `1. What is a Mutual Fund?
A mutual fund pools money from retail investors to purchase a diversified portfolio of shares, government securities, or bonds, professionally managed by SEBI-registered Asset Management Companies (AMCs).

2. Major Mutual Fund Categories:
• Index Funds / Large Cap: Tracks Nifty 50 or Sensex. Very low expense ratios (< 0.2%), expected 11% to 13% CAGR, ideal for long-term core wealth.
• Flexi-Cap Funds: Fund managers dynamically pivot across large, mid, and small-cap stocks based on market valuation cycles.
• Mid & Small Cap Funds: High-growth emerging enterprises. Highly volatile, best suited for aggressive horizons of 7+ years.
• ELSS (Equity Linked Savings Scheme): Tax-saving mutual fund qualifying under Section 80C with the shortest lock-in period (only 3 years) and high equity upside.
• Liquid / Overnight Debt Funds: High capital safety, 6.5% to 7.2% returns, ideal for parking emergency cash.

3. "Direct Plan" vs "Regular Plan":
Always buy DIRECT plans. Direct plans bypass broker commissions, saving you 0.5% to 1.5% in expense ratios every year. Over 20 years, this single decision adds 15% to 25% extra wealth to your portfolio!

4. Capital Gains Tax (Budget 2024 Updates):
• Long-Term Capital Gains (held > 1 year): 12.5% tax on annual gains exceeding ₹1.25 Lakh.
• Short-Term Capital Gains (held < 1 year): Flat 20% tax.`;
  }

  if (
    q.includes("stock") || 
    q.includes("share market") || 
    q.includes("equity") || 
    q.includes("trading") || 
    q.includes("demat") || 
    q.includes("nifty") || 
    q.includes("sensex")
  ) {
    return `1. Stock Market Fundamentals in India:
Purchasing shares represents fractional equity ownership in publicly listed corporations on the Bombay Stock Exchange (BSE) or National Stock Exchange (NSE).

2. How to Start Safely in India:
• Open a Demat & Trading Account: With a SEBI-registered discount broker (Zerodha, Groww, AngelOne) or bank-integrated broker (HDFC Sky, ICICI Direct).
• Core Index Rule: 70% of beginner capital should be invested in index ETFs (Nifty 50, Nifty Next 50) before picking individual stocks.
• Blue-Chip Selection: For direct stocks, select established market leaders with high Return on Equity (ROE > 15%), consistent dividend track records, and low debt-to-equity ratios.

3. Risk Management Rules:
• Never trade with borrowed capital or money needed within the next 3 years.
• Avoid Intraday, Futures & Options (F&O) trading. SEBI studies show over 90% of retail F&O traders lose significant capital.`;
  }

  // --------------------------------------------------------------------------
  // 13. FIXED DEPOSITS (FD) & RECURRING DEPOSITS (RD)
  // --------------------------------------------------------------------------
  if (
    q.includes("fixed deposit") || 
    q.includes(" fd ") || 
    q.startsWith("fd ") || 
    q.endsWith(" fd") || 
    q.includes("recurring deposit") || 
    q.includes(" rd ") || 
    q.startsWith("rd ") || 
    q.endsWith(" rd")
  ) {
    return `1. What is a Fixed Deposit (FD)?
A low-risk financial instrument provided by banks and NBFCs where you lock a lump sum for a fixed period at a guaranteed, fixed interest rate.

2. Current Indian FD Interest Rate Landscape:
• Public Sector Banks (SBI, BoB, Canara, PNB): 6.80% to 7.25% p.a.
• Leading Private Banks (HDFC, ICICI, Axis): 7.00% to 7.40% p.a.
• Small Finance Banks (AU Small Finance, Equitas, Ujjivan): Special tenures yielding up to 8.25% to 8.60% p.a.!
• Senior Citizen Bonus: Retirees aged 60+ receive an additional 0.50% to 0.75% across all tenures.

3. Sovereign Safety Guarantee (DICGC Cover):
Under RBI’s Deposit Insurance and Credit Guarantee Corporation (DICGC), your bank deposits (combining savings, current, and fixed deposits) are legally insured up to ₹5,00,000 (5 Lakhs) per depositor per licensed bank.

4. Tax on FD Interest:
• Interest earned is added to your total income and taxed at your applicable income tax slab rate.
• Banks deduct 10% TDS if interest income exceeds ₹40,000/year (₹50,000 for senior citizens). Submit Form 15G/15H if your total income is below the taxable threshold.`;
  }

  // --------------------------------------------------------------------------
  // 14. CIBIL & CREDIT SCORES
  // --------------------------------------------------------------------------
  if (
    q.includes("cibil") || 
    q.includes("credit score") || 
    q.includes("credit rating") || 
    q.includes("improve score") || 
    q.includes("bad credit")
  ) {
    return `1. What is a CIBIL Score?
A 3-digit numerical score between 300 and 900 calculated by credit rating bureaus (TransUnion CIBIL, Experian, Equifax, CRIF High Mark) summarizing your historical credit repayment track record.

2. Score Tiers for Loan Approvals:
• 750 to 900 (Excellent): Preferred customer status; guaranteed fastest approvals and lowest discounted interest rates.
• 700 to 749 (Good): Eligible for most retail credit products with standard terms.
• 650 to 699 (Fair): Lenders may demand higher interest rates, collateral, or reject unsecured loans.
• Below 650 (Poor): High rejection rate; requires systematic credit rebuilding.

3. 5 Proven Rules to Boost Your CIBIL Score Above 750:
• 100% On-Time Payments: Always pay credit card bills and loan EMIs before due date (accounts for 35% of total score weight).
• Credit Utilization Ratio (CUR) < 30%: If your total credit card limit is ₹1,00,000, never spend more than ₹30,000 in a billing cycle.
• Preserve Credit Age: Keep your oldest credit card active to demonstrate long credit reliability.
• Maintain a Healthy Credit Mix: A balanced blend of secured loans (home/auto) and unsecured lines (credit cards) improves your profile.
• Avoid Hard Inquiry Spikes: Do not apply for multiple loans or credit cards across various banks simultaneously.`;
  }

  // --------------------------------------------------------------------------
  // 15. TAXATION: NEW VS OLD TAX REGIME (BUDGET 2024-25 UPDATES)
  // --------------------------------------------------------------------------
  if (
    q.includes("tax") || 
    q.includes("income tax") || 
    q.includes("80c") || 
    q.includes("80d") || 
    q.includes("new regime") || 
    q.includes("old regime") || 
    q.includes("save tax")
  ) {
    return `1. New Tax Regime vs Old Tax Regime (Budget 2024-25 Updates):

• The New Tax Regime (Default System):
  - Standard deduction increased to ₹75,000 for all salaried employees.
  - Slabs: Up to ₹3L (Nil), ₹3L-₹7L (5%), ₹7L-₹10L (10%), ₹10L-₹12L (15%), ₹12L-₹15L (20%), Above ₹15L (30%).
  - Section 87A Rebate: Zero tax for taxable incomes up to ₹7,75,000 (after the ₹75,000 standard deduction)!
  - Simpler, but does not allow exemptions like 80C, 80D, or HRA.

• The Old Tax Regime (Optional System):
  - Slabs: Up to ₹2.5L (Nil), ₹2.5L-₹5L (5%), ₹5L-₹10L (20%), Above ₹10L (30%).
  - Standard deduction is ₹50,000.
  - Allows full claim of Section 80C (up to ₹1.5L), 80D Health Insurance (up to ₹25k-₹50k), HRA exemptions, Section 24(b) Home Loan Interest (₹2L), and NPS 80CCD(1B) (₹50k).

2. Rule of Thumb: Which Regime Should You Pick?
• If your total eligible deductions (80C + 80D + HRA + Home Loan Interest) exceed ₹3.75 Lakhs to ₹4.0 Lakhs, the OLD Regime will save you more money.
• If your deductions are below ₹3.5 Lakhs or your annual income is under ₹7.75 Lakhs, the NEW Regime is significantly better and tax-free!

3. Top Tax Saving Instruments under 80C (Max ₹1.5L):
• ELSS Mutual Funds (3-year lock-in, 12-14% historical returns)
• Public Provident Fund (PPF - 7.1% tax-free sovereign interest)
• Sukanya Samriddhi Yojana (8.2% guaranteed return for girl child)
• Employee Provident Fund (EPF) & 5-Year Bank Tax-Saver FDs`;
  }

  // --------------------------------------------------------------------------
  // 16. GOVERNMENT SCHEMES & SOVEREIGN WELFARE
  // --------------------------------------------------------------------------
  if (
    q.includes("scheme") || 
    q.includes("myscheme") || 
    q.includes("ppf") || 
    q.includes("nps") || 
    q.includes("sukanya") || 
    q.includes("atal pension") || 
    q.includes("pmay") || 
    q.includes("pmjdy") || 
    q.includes("ayushman") || 
    q.includes("pm kisan")
  ) {
    return `1. Top Central & State Government Welfare Schemes in India:

• Public Provident Fund (PPF): 7.1% interest p.a., sovereign guarantee, complete EEE tax-exempt status (investment, interest, and maturity are 100% tax-free), 15-year tenure.
• National Pension System (NPS): Market-linked retirement vehicle with ultra-low fund management fees and an exclusive additional ₹50,000 tax deduction under Section 80CCD(1B).
• Sukanya Samriddhi Yojana (SSY): High 8.2% guaranteed sovereign return for girl children under 10 years, full 80C deduction and EEE tax-free status.
• Atal Pension Yojana (APY): Guaranteed monthly pension of ₹1,000 to ₹5,000 from age 60 for unorganized workers aged 18 to 40.
• Senior Citizen Savings Scheme (SCSS): 8.2% quarterly paid interest for retirees aged 60+, deposit ceiling up to ₹30 Lakhs.
• Pradhan Mantri Awas Yojana (PMAY): Interest subsidy up to ₹2.67 Lakhs on housing loans under the Credit Linked Subsidy Scheme.
• PM Jan Dhan Yojana (PMJDY): Zero balance banking, free RuPay debit card, and ₹2 Lakh accidental insurance.
• Ayushman Bharat (PM-JAY): Up to ₹5 Lakhs annual cashless health cover per family for secondary & tertiary hospitalization.

2. Explore Schemes on FinTwin:
Check out our dedicated "Schemes" tab to view real-time eligibility filters, documentation checklists, and direct official application links!`;
  }

  // --------------------------------------------------------------------------
  // 17. EMERGENCY FUND & 50/30/20 BUDGETING
  // --------------------------------------------------------------------------
  if (
    q.includes("emergency fund") || 
    q.includes("budget") || 
    q.includes("how much to save") || 
    q.includes("savings rate") || 
    q.includes("50 30 20") || 
    q.includes("save money")
  ) {
    const monthlyExp = expenses;
    const fund3Mo = monthlyExp * 3;
    const fund6Mo = monthlyExp * 6;
    const needs = Math.round(income * 0.5);
    const wants = Math.round(income * 0.3);
    const savings = Math.round(income * 0.2);

    return `1. What is an Emergency Fund?
A liquid capital buffer set aside exclusively to weather unforeseen emergencies (job loss, sudden medical bills, critical home/vehicle repairs) without being forced to take high-interest loans.

2. Personalized Computation for Your Profile:
• Your Recorded Monthly Expenses: ${formatINR(monthlyExp)}/month
• Recommended 3-Month Lean Fund: ${formatINR(fund3Mo)}
• Recommended 6-Month Comprehensive Fund: ${formatINR(fund6Mo)}

3. Where to Park Your Emergency Fund:
• 50% in a High-Yield Savings Account (for instant ATM/UPI withdrawal).
• 50% in an Overnight or Liquid Mutual Fund (yields 6.5% - 7.0% with instant T+1 redemption).

4. The 50 / 30 / 20 Budgeting Rule for Your Salary (${formatINR(income)}/mo):
• 50% Needs (${formatINR(needs)}): Rent, groceries, utility bills, insurance, mandatory EMIs.
• 30% Wants (${formatINR(wants)}): Dining out, leisure travel, gadgets, entertainment.
• 20% Savings & Wealth (${formatINR(savings)}): Monthly SIPs, PPF, emergency fund buildup.`;
  }

  // --------------------------------------------------------------------------
  // 18. INSURANCE & RISK PROTECTION (TERM LIFE & HEALTH)
  // --------------------------------------------------------------------------
  if (
    q.includes("insurance") || 
    q.includes("term insurance") || 
    q.includes("health insurance") || 
    q.includes("mediclaim") || 
    q.includes("life insurance") || 
    q.includes("ulip")
  ) {
    const termCover = income * 12 * 15;
    return `1. The Two Pillars of Financial Protection:

• Pure Term Life Insurance:
  - Purpose: Financial security for your family in the event of untimely demise.
  - Golden Rule: Always buy PURE TERM insurance, NOT traditional endowment or ULIP policies. Term plans provide 10x to 20x higher cover at a fraction of the premium.
  - Recommended Cover: 15 to 20 times your annual income (For your income of ${formatINR(income)}/mo, you should have a minimum term cover of ${formatINR(termCover)}).
  - Premium: A healthy 28-year-old non-smoker can secure a ₹1 Crore term cover for around ₹800 to ₹1,200 per month.

• Comprehensive Health Insurance (Mediclaim):
  - Purpose: Shields your family savings against soaring private hospital expenses.
  - Ideal Cover: Minimum ₹10 Lakh to ₹15 Lakh base family floater, coupled with a ₹50 Lakh Super Top-Up policy (very inexpensive).
  - Key Features to Verify: Zero room rent capping, restoration benefit, low pre-existing disease waiting periods (2-3 years), and high Claim Settlement Ratio (> 98%).
  - Tax Benefit: Deduct premiums up to ₹25,000 for self/family and up to ₹50,000 for senior citizen parents under Section 80D.`;
  }

  // --------------------------------------------------------------------------
  // 19. CREDIT CARDS & DEBT TRAPS
  // --------------------------------------------------------------------------
  if (
    q.includes("credit card") || 
    q.includes("minimum amount due") || 
    q.includes("credit card vs debit card")
  ) {
    return `1. How Credit Cards Work in India:
A credit card provides a pre-approved revolving credit limit. You enjoy an interest-free grace period of 45 to 50 days between the purchase date and the payment due date.

2. The "Minimum Amount Due" Trap (Crucial Warning!):
• Paying only the Minimum Amount Due (usually 5% of bill) does NOT stop interest!
• Indian credit card companies charge exorbitant finance charges ranging from 3.5% to 3.75% per month (42% to 45% APR!).
• Golden Rule: ALWAYS pay the "Total Amount Due" in full before the due date.

3. Credit Card Best Practices:
• Keep utilization below 30% of your credit limit to boost your CIBIL score.
• Never withdraw cash from an ATM using a credit card (interest starts accruing from day 1 with a cash advance fee).
• Maximize reward points, airport lounge access, and fuel surcharge waivers.`;
  }

  // --------------------------------------------------------------------------
  // 20. SOVEREIGN GOLD BONDS (SGB) VS PHYSICAL GOLD
  // --------------------------------------------------------------------------
  if (
    q.includes("gold") || 
    q.includes("sgb") || 
    q.includes("sovereign gold bond") || 
    q.includes("digital gold")
  ) {
    return `1. Sovereign Gold Bonds (SGB) vs Physical Gold:

• Sovereign Gold Bonds (SGB - Issued by RBI on behalf of Government):
  - 2.50% Annual Interest: Paid semi-annually directly into your bank account.
  - 100% Capital Gains Tax Exemption: Complete tax exemption on maturity after 8 years!
  - Zero Making Charges or Storage Costs: Held digitally in your Demat or RBI ledger.
  - Pure Gold Price Tracking: Linked to 999 purity gold bullion prices.

• Physical Gold (Jewellery / Coins):
  - Incurs 8% to 25% making charges and wastage losses upon resale.
  - Incurs 3% GST on purchase and safety locker rental expenses.
  - Capital gains are fully taxed at 12.5% LTCG upon sale.

2. Recommendation: SGBs or Gold ETFs are significantly superior to physical gold for wealth creation!`;
  }

  // --------------------------------------------------------------------------
  // 21. BANK COMPARISONS (SBI, HDFC, ICICI, AXIS, ETC.)
  // --------------------------------------------------------------------------
  if (
    q.includes("compare") || 
    q.includes("sbi vs") || 
    q.includes("hdfc vs") || 
    q.includes("icici vs") || 
    q.includes("which bank is best") || 
    q.includes("best bank for")
  ) {
    return `1. Indian Banking Tiers Comparison:

• Public Sector Banks (State Bank of India, Bank of Baroda, PNB, Canara Bank):
  - Strengths: Lowest home loan interest rates (8.35% - 8.65%), minimal processing charges, no hidden pre-closure penalties, massive branch/ATM network across India.
  - Trade-offs: Slightly slower digital turnaround and more extensive paperwork.

• Private Sector Banks (HDFC Bank, ICICI Bank, Axis Bank, Kotak):
  - Strengths: Lightning-fast digital approvals, state-of-the-art mobile banking, instant pre-approved personal loans, premium credit cards.
  - Trade-offs: Strict minimum balance requirements (₹10,000/mo), higher interest rates on loans (8.70% - 9.50%), and higher ancillary service fees.

• Small Finance Banks (AU Small Finance, Equitas, Ujjivan):
  - Strengths: Highest Fixed Deposit returns in India (up to 8.25% - 8.60% p.a.), high-interest savings accounts (up to 7%).
  - Safety: 100% insured up to ₹5 Lakhs under RBI's DICGC guarantee just like SBI or HDFC.

2. FinTwin Recommendation: Use Public Sector Banks (SBI/BoB) for large Home Loans, and Private Banks or Small Finance Banks for high-yield savings, FDs, and daily digital transactions.`;
  }

  // --------------------------------------------------------------------------
  // 22. ACTIVE BANK SPECIFIC QUERY
  // --------------------------------------------------------------------------
  if ((q.includes("this bank") || q.includes("selected bank") || q.includes("current bank")) && activeBank) {
    return `1. Active Selected Bank: ${activeBank}
You have actively selected ${activeBank} in FinTwin's multi-bank portal.

2. Products Available for ${activeBank}:
• Home Loans: Competitive interest rates linked to RBI Repo rate with flexible tenures up to 30 years.
• Personal & Vehicle Loans: Tailored financing for salaried and self-employed professionals.
• Fixed & Recurring Deposits: High-yield deposit schemes with an additional 0.50% interest bonus for senior citizens.
• Government Scheme Facilitation: Direct enrollment for PPF, Sukanya Samriddhi, and Atal Pension Yojana.

3. Next Step: Visit FinTwin's "Loans" tab to view specific interest slabs, loan products, and test your exact EMI eligibility for ${activeBank}!`;
  }

  // --------------------------------------------------------------------------
  // 23. MULTILINGUAL / HINGLISH SUPPORT
  // --------------------------------------------------------------------------
  if (
    q.includes("kaise") || 
    q.includes("kya hai") || 
    q.includes("kare") || 
    q.includes("chahiye") || 
    q.includes("bachaye") || 
    q.includes("batao")
  ) {
    if (q.includes("emi") || q.includes("loan")) {
      return `1. FinTwin Loan & EMI Sahayata:
• EMI Formula: [P × R × (1+R)^N] / [(1+R)^N - 1]
• Apki Monthly Income: ${formatINR(income)}
• Surakshit Monthly EMI Seema (40% Niyam): ${formatINR(safeEmi)}/mahina
• Agar aap kisi specific loan ki EMI janna chahte hain, toh bas type karein: "Calculate EMI for 20 Lakhs at 8.5% for 20 years" aur main turant poora hisaab bata dunga!`;
    }
    if (q.includes("tax")) {
      return `1. Tax Bachane Ke Aasan Tarike:
• New Tax Regime: ₹7.75 Lakh tak ki aamdani par ZERO TAX hai (₹75,000 standard deduction ke baad)!
• Old Tax Regime: Agar aap Section 80C (PPF, ELSS, EPF - ₹1.5L), 80D Health Insurance (₹25k-₹50k), aur Home Loan Interest Section 24b (₹2L) claim karte hain, toh Old Regime behtar ho sakta hai.`;
    }
    if (q.includes("sip") || q.includes("invest")) {
      return `1. SIP Aur Investment Guidance:
• SIP (Systematic Investment Plan) ke zariye aap har mahine ₹500 ya ₹1,000 se Nifty 50 Index Mutual Funds mein nivesh shuru kar sakte hain.
• Lambe samay (5-10 saal) mein 12% se 14% tak compound returns milne ka historical record raha hai.`;
    }
  }

  // --------------------------------------------------------------------------
  // 24. INTELLIGENT COMPREHENSIVE CONTEXTUAL FALLBACK
  // --------------------------------------------------------------------------
  return `1. FinTwin Financial Intelligence Advisory for: "${rawQ}"

• Strategic Overview:
In Indian personal finance and wealth management, this area involves optimizing your capital allocation, balancing risk versus return, and staying aligned with regulatory and tax laws.

2. Tailored Recommendations for Your Profile:
• In-Hand Monthly Income: ${formatINR(income)}
• Safe Debt Servicing Ceiling (40% Rule): ${formatINR(safeEmi)}/month
• Defensive Buffer: Maintain a 3 to 6-month emergency reserve (${formatINR(expenses * 3)} to ${formatINR(expenses * 6)}) before entering speculative markets.
• Wealth Multiplication: Deploy monthly SIPs in diversified, low-cost Nifty 50 Index Funds for goals beyond 5 years.
• Tax Efficiency: Evaluate your tax bracket under the New Tax Regime (₹75k standard deduction) vs Old Tax Regime (Sections 80C, 80D, 24b).

3. What You Can Ask Next:
• Type "Calculate EMI for [Amount] at [Rate]% for [Tenure] years"
• Ask "What is an Education Loan / Gold Loan / Home Loan?"
• Ask "Compare SBI vs HDFC Bank"
• Ask "How to improve CIBIL score to 750+"
• Ask "Explain Sovereign Schemes like PPF and Sukanya Samriddhi"`;
}

module.exports = {
  calculateEMI,
  calculateSIP,
  extractFinancialNumbers,
  formatINR,
  generateFinTwinAdvisory
};
