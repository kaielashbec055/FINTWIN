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

module.exports = {
  validateFinancialValues,
  calculateSavings,
  calculateFOIRCapacity,
  buildFinancialProfileWithProvenance
};

