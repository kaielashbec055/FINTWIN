// ============================================================================
// FINTWIN CORE FINANCIAL INTELLIGENCE & KNOWLEDGE ENGINE (Node.js Backend)
// Deep, comprehensive expert financial reasoning for retail Indian users
// ============================================================================

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
    tenureMonths: n
  };
}

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
    tenureYears
  };
}

function extractFinancialNumbers(text) {
  const str = text.toLowerCase().replace(/,/g, '');

  let amount = null;
  const lakhMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|l)\b/);
  const croreMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:crore|crores|cr)\b/);
  const plainNumMatch = str.match(/(?:₹|rs\.?|inr)?\s*(\d{4,9})\b/);

  if (croreMatch) {
    amount = parseFloat(croreMatch[1]) * 10000000;
  } else if (lakhMatch) {
    amount = parseFloat(lakhMatch[1]) * 100000;
  } else if (plainNumMatch) {
    amount = parseFloat(plainNumMatch[1]);
  }

  let rate = null;
  const rateMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:%|percent)/);
  if (rateMatch) {
    rate = parseFloat(rateMatch[1]);
  }

  let years = null;
  const yearMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/);
  if (yearMatch) {
    years = parseFloat(yearMatch[1]);
  }

  return { amount, rate, years };
}

function generateFinTwinAdvisory(query, activeBank = "", profile = {}) {
  const q = (query || "").trim().toLowerCase();
  const income = Number(profile?.monthlyIncome) || 50000;
  const safeEmi = Math.round(income * 0.4);
  const parsedNums = extractFinancialNumbers(query);

  // 1. EMI CALCULATOR
  if (q.includes("emi") && (q.includes("calculate") || parsedNums.amount || q.includes("for"))) {
    const p = parsedNums.amount || 2500000;
    const r = parsedNums.rate || 8.5;
    const y = parsedNums.years || 20;

    const result = calculateEMI(p, r, y);
    if (result) {
      return `1. EMI Calculation Result: For a loan principal of ₹${result.principal.toLocaleString('en-IN')} at ${r}% p.a. for ${y} years (${result.tenureMonths} months):
- Monthly EMI: ₹${result.emi.toLocaleString('en-IN')}
- Total Principal: ₹${result.principal.toLocaleString('en-IN')}
- Total Interest Payable: ₹${result.totalInterest.toLocaleString('en-IN')}
- Total Repayment Amount: ₹${result.totalPayment.toLocaleString('en-IN')}

2. Debt-to-Income Feasibility:
- Your net monthly income is ₹${income.toLocaleString('en-IN')}.
- Recommended maximum EMI ceiling (40% rule): ₹${safeEmi.toLocaleString('en-IN')}/month.
- Assessment: ${result.emi <= safeEmi ? `✓ This EMI of ₹${result.emi.toLocaleString('en-IN')} is well within your safe debt capacity.` : `⚠ Warning: This EMI of ₹${result.emi.toLocaleString('en-IN')} exceeds your recommended safe ceiling of ₹${safeEmi.toLocaleString('en-IN')}. Consider extending the tenure to reduce monthly pressure.`}

3. Money-Saving Tip: Making just one extra EMI payment every year or prepaying 5% of principal annually can reduce your loan tenure by up to 4-5 years and save lakhs in interest!`;
    }
  }

  // 2. SIP (SYSTEMATIC INVESTMENT PLAN)
  if (
    q.includes("sip") || 
    q.includes("systematic investment") || 
    (q.includes("invest") && q.includes("monthly"))
  ) {
    let sipAmount = parsedNums.amount || 5000;
    let sipYears = parsedNums.years || 10;
    let expectedRate = parsedNums.rate || 13;
    const sipResult = calculateSIP(sipAmount, expectedRate, sipYears);

    return `1. What is a SIP (Systematic Investment Plan)?
A Systematic Investment Plan (SIP) is a disciplined investment method offered by Indian Mutual Funds. Instead of investing a large lump sum all at once, you invest a fixed amount regularly (monthly or quarterly) into your chosen mutual fund scheme.

2. How SIP Works in Practice:
- Automated Investing: The fixed amount is auto-debited from your bank account on a set date every month.
- Rupee Cost Averaging: When the stock market dips, fund units become cheaper, so your fixed amount buys MORE units. When markets rise, it buys fewer units. This completely eliminates the stress of "timing the market".
- Power of Compounding: Every rupee earned generates its own returns over time, multiplying your wealth exponentially.

3. Key Advantages of SIP:
- Accessible to Everyone: Start with as little as ₹500 or ₹1,000 per month.
- High Historical Returns: Well-managed diversified equity and Nifty 50 index funds have delivered 12% to 15% CAGR over 5+ year horizons.
- Complete Flexibility: You can pause, stop, increase (via Step-up SIP), or withdraw your funds at any time with zero lock-in (except for tax-saving ELSS funds which have a 3-year lock-in).

4. Wealth Accumulation Simulation:
If you invest ₹${sipAmount.toLocaleString('en-IN')} per month for ${sipYears} years at an expected ${expectedRate}% return:
- Total Amount You Invest: ₹${sipResult.totalInvested.toLocaleString('en-IN')}
- Estimated Wealth Accumulated: ₹${sipResult.futureValue.toLocaleString('en-IN')}
- Pure Wealth Gain: ₹${sipResult.estimatedReturns.toLocaleString('en-IN')} (Your money grows by ${(sipResult.futureValue / sipResult.totalInvested).toFixed(1)}x!)

5. Actionable Recommendation for You:
Based on your recorded monthly income of ₹${income.toLocaleString('en-IN')}, aim to channel 15% to 20% of your monthly savings into a diversified portfolio consisting of:
- 50% in a Nifty 50 Index Fund (stable, low expense ratio)
- 30% in a Flexi-Cap or Large & Mid-Cap Fund (growth potential)
- 20% in Sovereign Gold Bonds or Fixed Deposits (capital safety)`;
  }

  // 3. MUTUAL FUNDS & STOCKS
  if (
    q.includes("mutual fund") || 
    q.includes("mutual funds") || 
    q.includes("index fund") || 
    q.includes("equity fund") ||
    q.includes("elss")
  ) {
    return `1. What is a Mutual Fund?
A mutual fund pools money from thousands of investors to invest in a diversified basket of stocks, bonds, or government securities, professionally managed by an Asset Management Company (AMC) registered with SEBI.

2. Major Categories of Mutual Funds in India:
- Large Cap / Index Funds: Invest in India's top 100 companies (Nifty 50, Sensex). Low volatility, ideal for long-term core wealth (expected 11-13% return).
- Flexi-Cap / Multi-Cap Funds: Fund managers dynamically invest across large, mid, and small companies based on market conditions.
- Mid & Small Cap Funds: Invest in high-growth emerging companies. Higher volatility, suitable for aggressive investors with a 7+ year horizon.
- ELSS (Equity Linked Savings Scheme): Tax-saving mutual fund offering deductions up to ₹1.5 Lakh under Section 80C, with the shortest lock-in period among all tax-saving instruments (only 3 years).
- Debt & Liquid Funds: Invest in government bonds and corporate paper. High safety, predictable yields (6.5% - 7.5%), ideal for emergency parking.

3. Direct vs Regular Plans:
Always choose "Direct - Growth" plans over "Regular" plans. Direct plans have zero distributor commission, saving you 0.5% to 1.5% in expense ratio every single year, adding lakhs to your maturity value.

4. Taxation on Mutual Funds (Post July 2024 Budget):
- Long-Term Capital Gains (LTCG held > 1 year): 12.5% tax on gains exceeding ₹1.25 Lakh per financial year.
- Short-Term Capital Gains (STCG held < 1 year): Taxed at flat 20%.`;
  }

  if (q.includes("stock") || q.includes("share market") || q.includes("equity") || q.includes("trading") || q.includes("demat")) {
    return `1. Stock Market Fundamentals:
Buying a stock means purchasing a fractional ownership share of a publicly listed business on the BSE or NSE.

2. How to Start in India:
- Prerequisites: You need a PAN Card, Aadhaar-linked mobile number, and a Demat & Trading account with a SEBI-registered broker (such as Zerodha, Groww, AngelOne, or bank-backed brokers like HDFC Sky/ICICI Direct).
- Initial Strategy: Beginners should prioritize fundamentally sound, large-cap companies with consistent profitability, low debt-to-equity ratios, and strong return on equity (ROE > 15%).

3. Direct Stocks vs Mutual Funds:
- Direct Stocks: Offer maximum upside potential but require time, financial statement analysis, and portfolio monitoring.
- Mutual Funds / ETFs: Provide instant diversification across 50+ companies with professional fund management and lower individual company risk.

4. Key Risk Management Golden Rules:
- Never invest emergency funds or borrowed money into direct equities.
- Maintain a minimum 3 to 5 year horizon to ride out short-term market corrections.`;
  }

  // 4. FIXED DEPOSITS (FD)
  if (q.includes("fixed deposit") || q.includes(" fd ") || q.endsWith(" fd") || q.startsWith("fd ") || q.includes("recurring deposit") || q.includes(" rd ")) {
    return `1. What is a Fixed Deposit (FD)?
A Fixed Deposit is a low-risk financial instrument provided by banks and NBFCs where you deposit a lump sum for a predetermined period at a guaranteed, fixed interest rate.

2. Current FD Interest Rate Landscape in India:
- Public Sector Banks (SBI, BoB, PNB): 6.80% to 7.25% p.a. for tenures of 1 to 5 years.
- Private Banks (HDFC, ICICI, Axis): 7.00% to 7.40% p.a.
- Small Finance Banks (AU Small Finance, Equitas, Ujjivan): Special tenures offering between 8.00% and 8.60% p.a.
- Senior Citizens Privilege: Receive an additional 0.50% to 0.75% interest over standard public rates.

3. Safety Guarantee (DICGC Protection):
Under RBI's Deposit Insurance and Credit Guarantee Corporation (DICGC), your bank deposits (including principal and interest across savings, current, and FDs) are 100% legally insured up to ₹5,00,000 (5 Lakhs) per depositor per registered bank.

4. Tax on FD Interest:
- Interest earned is added to your total income and taxed at your applicable income tax slab rate.
- Banks deduct 10% TDS if interest income exceeds ₹40,000/year (₹50,000 for senior citizens). You can submit Form 15G / 15H if your total income is non-taxable.`;
  }

  // 5. HOME LOANS
  if (q.includes("home loan") || q.includes("housing loan")) {
    return `1. What is a Home Loan?
A secured credit facility granted by banks and housing finance companies (HFCs) to purchase a ready-to-move apartment, under-construction property, plot, or for house renovation.

2. Benchmark Interest Rates & Terms in India:
- Prevailing Interest Rates: 8.35% to 9.50% p.a., floating and tied to the RBI Repo Linked Lending Rate (RLLR).
- Loan-to-Value (LTV) Ratio: Banks fund up to 90% for loans up to ₹30 Lakhs, 80% for loans between ₹30L to ₹75L, and 75% for loans above ₹75 Lakhs.
- Tenure: Up to 30 years, lowering monthly EMI obligations.

3. Triple Tax Deductions Available:
- Section 80C: Deduct up to ₹1,50,000 on principal repayment per year.
- Section 24(b): Deduct up to ₹2,00,000 on home loan interest paid for a self-occupied property.
- Joint Home Loans: If co-borrowing with spouse, BOTH co-borrowers can separately claim these limits, doubling total deductions to ₹7 Lakhs per household!

4. Eligibility for Your Profile:
With your monthly income of ₹${income.toLocaleString('en-IN')}, your comfortable loan sanction capacity is approximately ₹${(safeEmi * 115).toLocaleString('en-IN')} for a 20-year term.`;
  }

  // 6. PERSONAL LOANS
  if (q.includes("personal loan")) {
    return `1. What is a Personal Loan?
An unsecured credit facility that requires no collateral or asset pledge. Approval is based primarily on your monthly salary, employer reputation, and CIBIL credit score.

2. Key Terms & Rate Ranges:
- Interest Rates: 10.25% to 15.00% p.a. for prime salaried borrowers (can exceed 18% for lower CIBIL scores).
- Tenure: 12 months to 60 months (1 to 5 years).
- Disbursal Speed: Instant to 24 hours digitally via net banking.

3. Critical Precautions Before Availing:
- Processing Fees: Compare processing fees (typically 1% to 2.5% + 18% GST).
- Preclosure Charges: Check lock-in clauses and part-prepayment charges.
- EMI Limit: Ensure your total monthly personal loan EMI does not exceed 25% of your in-hand salary.`;
  }

  // 7. CIBIL & CREDIT SCORE
  if (q.includes("cibil") || q.includes("credit score") || q.includes("credit rating")) {
    return `1. What is a CIBIL Score?
A 3-digit numerical summary (ranging from 300 to 900) prepared by credit bureaus (TransUnion CIBIL, Experian, Equifax, CRIF High Mark) reflecting your past credit repayment track record.

2. Score Tiers for Loan Approvals:
- 750 to 900 (Excellent): Guaranteed fastest loan approvals at the lowest discounted interest rates.
- 700 to 749 (Good): Eligible for most credit products with standard terms.
- 600 to 699 (Fair): Lenders may demand higher interest rates, higher collateral, or reject unsecured loans.
- Below 600 (Poor): High rejection rate; requires immediate remedial rebuilding.

3. 5 Proven Rules to Boost Your CIBIL Score Above 750:
- 100% On-Time Payments: Paying EMIs and credit card bills before the due date contributes 35% of your total score weight.
- Credit Utilization Ratio (CUR) < 30%: If your credit card limit is ₹1,00,000, never spend more than ₹30,000 in a billing cycle.
- Maintain Credit Age: Do not close your oldest credit cards, as long credit history boosts trustworthiness.
- Healthy Credit Mix: Maintain a balanced combination of secured loans (home/car) and unsecured lines (credit cards).
- Avoid Hard Inquiry Spikes: Do not apply for multiple loans or cards across different banks within a short window.`;
  }

  // 8. TAXATION: NEW VS OLD REGIME
  if (q.includes("tax") || q.includes("income tax") || q.includes("80c") || q.includes("new regime") || q.includes("old regime")) {
    return `1. New Tax Regime vs Old Tax Regime (Budget 2024-25 Updates):
- New Tax Regime (Default):
  - Standard deduction increased to ₹75,000 for salaried employees.
  - Slabs: Up to ₹3L (Nil), ₹3L-₹7L (5%), ₹7L-₹10L (10%), ₹10L-₹12L (15%), ₹12L-₹15L (20%), Above ₹15L (30%).
  - Zero Tax under Section 87A rebate for taxable incomes up to ₹7,75,000 (after standard deduction).
  - Simpler, but does NOT allow deductions like 80C, 80D, or HRA.
- Old Tax Regime (Optional):
  - Allows full claim of Section 80C (up to ₹1.5L), 80D Health Insurance (up to ₹25k-₹50k), HRA exemptions, Home Loan Interest under Section 24b (₹2L), and NPS (80CCD(1B) - ₹50k).
  - Beneficial if your total eligible deductions exceed ₹3.75 Lakhs to ₹4 Lakhs.

2. Top Tax-Saving Instruments under 80C (Max ₹1.5 Lakhs):
- ELSS Mutual Funds: 3-year lock-in, 12-15% expected equity growth.
- Public Provident Fund (PPF): 15-year tenure, 7.1% tax-free sovereign interest.
- EPF / VPF: Employee Provident Fund contributions.
- Sukanya Samriddhi Yojana (SSY): 8.2% guaranteed returns for girl child.
- National Savings Certificate (NSC) & 5-Year Bank Tax Saver FDs.`;
  }

  // 9. SOVEREIGN SCHEMES
  if (
    q.includes("scheme") || 
    q.includes("myscheme") || 
    q.includes("ppf") || 
    q.includes("nps") || 
    q.includes("sukanya") || 
    q.includes("atal pension") || 
    q.includes("mudra") || 
    q.includes("pmay")
  ) {
    return `1. Sovereign Wealth & Social Security Schemes in India:
- Public Provident Fund (PPF): 7.1% interest p.a. complete EEE tax-exempt status (Exempt on investment, interest, and maturity) with 15-year tenure.
- National Pension System (NPS): Market-linked retirement account with extra ₹50,000 deduction under Section 80CCD(1B) over and above 80C.
- Sukanya Samriddhi Yojana (SSY): High 8.2% sovereign guaranteed return for girls under 10 years, full EEE tax exemption under 80C.
- Atal Pension Yojana (APY): Guaranteed monthly pension of ₹1,000 to ₹5,000 from age 60 for unorganized sector workers aged 18 to 40.
- Senior Citizens Savings Scheme (SCSS): 8.2% quarterly paid interest for retirees aged 60+, deposit ceiling up to ₹30 Lakhs.
- Pradhan Mantri Mudra Yojana (PMMY): Collateral-free micro-business loans under Shishu (up to ₹50k), Kishore (₹50k-₹5L), and Tarun (up to ₹10L/₹20L).
- Pradhan Mantri Awas Yojana (PMAY): Interest subsidy up to ₹2.67 Lakhs on housing loans under Credit Linked Subsidy Scheme.

2. Explore Schemes Tab:
FinTwin has a dedicated "Schemes" section loaded with official Government of India myScheme data where you can view eligibility criteria, required documents, and apply directly via myscheme.gov.in!`;
  }

  // 10. EMERGENCY FUND & BUDGETING
  if (q.includes("emergency fund") || q.includes("budget") || q.includes("savings") || q.includes("how much to save")) {
    const monthlyExp = Number(profile?.monthlyExpenses) || 25000;
    return `1. What is an Emergency Fund?
An emergency fund is a liquid financial buffer set aside strictly for unforeseen crises such as job loss, medical emergencies, or critical car/home repairs.

2. How Much Do You Need?
- Standard Rule: 3 to 6 months of mandatory living expenses.
- Personalized Computation for You:
  - Your recorded monthly expenses: ₹${monthlyExp.toLocaleString('en-IN')}/month.
  - Recommended 3-Month Fund: ₹${(monthlyExp * 3).toLocaleString('en-IN')}
  - Recommended 6-Month Fund: ₹${(monthlyExp * 6).toLocaleString('en-IN')}

3. Where to Park Your Emergency Fund:
- 50% in a High-Yield Savings Account (instant debit card ATM access).
- 50% in an Overnight or Liquid Mutual Fund (yields 6.5% - 7.0% with T+1 instant withdrawal).

4. The 50 / 30 / 20 Budgeting Principle:
- 50% for Needs: Rent, groceries, utility bills, school fees, EMIs.
- 30% for Wants: Dining out, leisure travel, gadgets, entertainment.
- 20% for Savings & Investments: SIPs, PPF, emergency fund, and retirement corpus.`;
  }

  // 11. GREETINGS
  if (q === "hi" || q === "hello" || q === "hey" || q.includes("who are you") || q.includes("what can you do")) {
    return `1. Welcome to FinTwin AI Advisor!
I am your personal financial intelligence assistant designed to help retail Indian borrowers and investors make smarter, data-backed monetary decisions.

2. What You Can Ask Me:
- Investment Insights: "What is SIP?", "Explain Mutual Funds vs FDs", "Where should I invest ₹10,000 monthly?"
- Loan Calculations & Guidance: "Calculate EMI for ₹25 Lakhs at 8.5% for 20 years", "How to get a home loan?", "What is a good CIBIL score?"
- Government Schemes: "What schemes can I get for housing?", "Explain Sukanya Samriddhi Yojana or PPF"
- Tax Planning: "New vs Old Tax Regime", "How to save tax under 80C?"
- Bank Comparisons: "Compare SBI vs HDFC loan rates"

3. Your Current Profile Context:
- Monthly Income: ₹${income.toLocaleString('en-IN')}
- Safe Monthly EMI Ceiling: ₹${safeEmi.toLocaleString('en-IN')}
- Active Bank Mode: ${activeBank || "Universal Multi-Bank Explorer"}

How can I assist you with your financial planning today?`;
  }

  // 12. GENERAL FINANCIAL ADVISORY
  return `1. FinTwin Financial Intelligence Analysis for "${query}":
- Core Principle: In Indian personal finance, this topic relates to managing your capital allocation, debt management, or risk protection effectively.
- Practical Takeaway: Always evaluate the risk-adjusted returns, tax implications (under Old/New regime), liquidity constraints, and lock-in periods before committing capital.

2. Personal Financial Profile Context:
- Recorded In-Hand Monthly Income: ₹${income.toLocaleString('en-IN')}
- Safe Debt Servicing Ceiling (40% Rule): ₹${safeEmi.toLocaleString('en-IN')}/month
- Risk Appetite: ${profile?.riskAppetite || "Moderate"}

3. Key Recommendations for Action:
- Capital Safety: Prioritize establishing a 3-6 month emergency fund before speculative investments.
- Systematic Growth: Utilize monthly SIPs in diversified index mutual funds for goals > 5 years.
- Tax Optimization: Review applicable deductions under Section 80C, 80D, and the New Tax Regime.

4. Explore Further:
You can ask me to calculate exact EMIs, compare loan products across banks, or explore sovereign schemes under the Schemes tab!`;
}

module.exports = {
  calculateEMI,
  calculateSIP,
  extractFinancialNumbers,
  generateFinTwinAdvisory
};
