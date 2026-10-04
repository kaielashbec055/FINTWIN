/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { ChevronDown, Check, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import './LoansAndInvestments.css';
import {
  BANK_CATEGORIES,
  LOAN_CATEGORIES,
  LOAN_TENURE_OPTIONS,
  DEFAULT_PRINCIPALS,
  BANKS_DATA,
  UNIVERSAL_GOVERNMENT_SCHEMES
} from '../data/banksData';

const calculateLoanMetrics = (p, annualRate, years, monthlyIncome) => {
  const P = parseFloat(p) || 0;
  if (P <= 0 || annualRate <= 0) return { emi: 0, totalPayable: 0, interestPaid: 0, pctOfIncome: "0.0" };

  const monthlyRate = (annualRate / 12) / 100;
  const numberOfMonths = years * 12;

  const emi = (P * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) / (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
  const totalPayable = emi * numberOfMonths;
  const interestPaid = totalPayable - P;
  const pctOfIncome = monthlyIncome > 0 ? ((emi / monthlyIncome) * 100).toFixed(1) : "0.0";

  return {
    emi: Math.round(emi),
    totalPayable: Math.round(totalPayable),
    interestPaid: Math.round(interestPaid),
    pctOfIncome
  };
};

export default function LoansAndInvestments({ profile }) {
  const [activeTab, setActiveTab] = useState('loans');

  // Multi-Bank Category and Bank Selection
  const [bankCategory, setBankCategory] = useState("Public Sector Banks");
  const [selectedBankId, setSelectedBankId] = useState("SBI");
  const [loanCategory, setLoanCategory] = useState("Housing Loans");

  // Selection states for loan products
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [confirmedProducts, setConfirmedProducts] = useState([]);

  // Tenure & Principal
  const [loanType, setLoanType] = useState('Home Loan (30y)');
  const [principal, setPrincipal] = useState(2500000);

  // User financial profile data
  const userEmail = localStorage.getItem("userEmail") || "user";
  const storedIncome = localStorage.getItem(`${userEmail}_totalIncome`);
  const monthlyIncome = Number(profile?.monthlyIncome || profile?.totalIncome || storedIncome || 50000);

  const targetHorizon = profile?.investmentTimeline || localStorage.getItem(`${userEmail}_investmentHorizon`) || "5";
  const targetRisk = profile?.riskTolerance || localStorage.getItem(`${userEmail}_riskTolerance`) || "medium";
  const safeEmiCapPercent = 40;

  // Dynamic CIBIL credit score estimate based on risk profile
  const creditScore = targetRisk.toLowerCase() === "low" ? 780 
    : targetRisk.toLowerCase() === "high" ? 650 
    : 720;
  const creditLabel = creditScore >= 750 ? "Excellent" : creditScore >= 700 ? "Good" : "Fair";
  const creditColor = creditScore >= 750 ? "#10b981" : creditScore >= 700 ? "#f59e0b" : "#ef4444";

  // Banks in the currently selected category
  const banksInCategory = BANKS_DATA[bankCategory] || [];
  const currentBank = banksInCategory.find(b => b.id === selectedBankId) || banksInCategory[0] || null;

  // Synchronize active bank context with localStorage for Chatbot / AI Advisor integration
  useEffect(() => {
    if (currentBank) {
      localStorage.setItem("fintwin_selected_bank", currentBank.name);
      localStorage.setItem("fintwin_selected_bank_category", bankCategory);
    }
  }, [currentBank, bankCategory]);

  // Available loan products for current bank and loan category
  const availableProducts = (currentBank?.loans && currentBank.loans[loanCategory]) || [];

  // Available tenure options for current loan category
  const tenureOptions = LOAN_TENURE_OPTIONS[loanCategory] || [{ label: "Term (5y)", years: 5 }];

  // Selected tenure in years derived from loanType
  const activeTenureObj = tenureOptions.find(t => t.label === loanType) || tenureOptions[0];
  const loanTenureYears = activeTenureObj ? activeTenureObj.years : 5;

  // Handle Bank Category Change
  const handleBankCategoryChange = (e) => {
    const newCategory = e.target.value;
    setBankCategory(newCategory);
    const newBanks = BANKS_DATA[newCategory] || [];
    if (newBanks.length > 0) {
      setSelectedBankId(newBanks[0].id);
    }
    setSelectedProducts([]);
    setConfirmedProducts([]);
  };

  // Handle Bank Selection Change
  const handleBankChange = (e) => {
    const newBankId = e.target.value;
    setSelectedBankId(newBankId);
    setSelectedProducts([]);
    setConfirmedProducts([]);
  };

  // Handle Loan Category Change
  const handleLoanCategoryChange = (e) => {
    const newLoanCategory = e.target.value;
    setLoanCategory(newLoanCategory);
    setSelectedProducts([]);
    setConfirmedProducts([]);

    // Update tenure option and default principal to match loan category
    const newTenures = LOAN_TENURE_OPTIONS[newLoanCategory] || [];
    if (newTenures.length > 0) {
      setLoanType(newTenures[0].label);
    }
    if (DEFAULT_PRINCIPALS[newLoanCategory]) {
      setPrincipal(DEFAULT_PRINCIPALS[newLoanCategory]);
    }
  };

  // Toggle checkbox for a loan product
  const toggleProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  // Compare button click handler
  const handleCompareClick = (e) => {
    e.preventDefault();
    if (selectedProducts.length === 0) {
      alert("Please select at least 1 loan product checkbox first!");
      return;
    }
    setConfirmedProducts([...selectedProducts]);
  };

  // Computed cards for confirmed products
  const calculatedCards = availableProducts
    .filter(prod => confirmedProducts.includes(prod.id))
    .map(prod => {
      const metrics = calculateLoanMetrics(principal, prod.rate, loanTenureYears, monthlyIncome);
      return {
        ...prod,
        bankName: currentBank?.name || "Selected Bank",
        bankUrl: currentBank?.url || "https://rbi.org.in",
        activeRate: prod.rate,
        ...metrics
      };
    });

  const bestCard = calculatedCards.length > 0 
    ? [...calculatedCards].sort((a, b) => a.emi - b.emi)[0] 
    : null;

  return (
    <div className="loans-container">
      {/* HEADER SECTION */}
      <div className="loans-header">
        <span className="subtitle">FinTwin Multi-Bank Finance & Wealth Intelligence</span>
        <h1 className="title">Loans & Investments</h1>
        <p className="description">
          Explore and compare dynamic loan products across India's premier public, private, rural, small finance, and cooperative banks with real-time income stress testing.
        </p>
      </div>

      {/* NAVIGATION TABS */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'loans' ? 'active' : ''}`} 
          onClick={() => setActiveTab('loans')}
        >
          Bank Loan Products
        </button>
        <button 
          className={`tab-btn ${activeTab === 'investments' ? 'active' : ''}`} 
          onClick={() => setActiveTab('investments')}
        >
          Wealth & Investment Schemes
        </button>
      </div>

      <div className="workspace-layout">
        {activeTab === 'loans' ? (
          <>
            {/* LEFT SELECTION COLUMN FORM (Matches visual card reference) */}
            <div className="control-panel">
              {/* 1. BANK CATEGORY */}
              <div className="form-group">
                <label className="input-label">Bank Category</label>
                <div className="select-wrapper">
                  <select 
                    value={bankCategory} 
                    onChange={handleBankCategoryChange}
                    className="form-select"
                  >
                    {BANK_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <ChevronDown className="select-icon" />
                </div>
              </div>

              {/* 2. SELECT BANK */}
              <div className="form-group">
                <label className="input-label">Select Bank</label>
                <div className="select-wrapper">
                  <select 
                    value={selectedBankId} 
                    onChange={handleBankChange}
                    className="form-select"
                  >
                    {banksInCategory.map(bank => (
                      <option key={bank.id} value={bank.id}>{bank.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="select-icon" />
                </div>
              </div>

              {/* 3. LOAN CATEGORY */}
              <div className="form-group">
                <label className="input-label">Loan Category</label>
                <div className="select-wrapper">
                  <select 
                    value={loanCategory} 
                    onChange={handleLoanCategoryChange}
                    className="form-select"
                  >
                    {LOAN_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <ChevronDown className="select-icon" />
                </div>
              </div>

              {/* 4. AVAILABLE LOAN PRODUCTS (PICK 1 OR MORE) */}
              <div className="form-group">
                <label className="input-label">Available Loan Products (Pick 1 or more)</label>
                <div className="checkbox-list">
                  {availableProducts.length === 0 ? (
                    <div style={{ padding: "14px", color: "#64748b", fontSize: "0.85rem", textAlign: "center" }}>
                      No loan products available for this category.
                    </div>
                  ) : (
                    availableProducts.map((prod) => (
                      <div 
                        key={prod.id} 
                        onClick={() => toggleProduct(prod.id)} 
                        className="checkbox-row"
                      >
                        <div className="checkbox-left">
                          <div className={`custom-checkbox ${selectedProducts.includes(prod.id) ? 'checked' : ''}`}>
                            {selectedProducts.includes(prod.id) && <Check className="check-icon" />}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span className="bank-name">{prod.name}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#800020", background: "#fdf2f4", padding: "2px 8px", borderRadius: "6px" }}>
                          {prod.rate}%
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 5. LOAN TYPE / TENURE */}
              <div className="form-group">
                <label className="input-label">Loan Type</label>
                <div className="select-wrapper">
                  <select 
                    value={loanType} 
                    onChange={(e) => setLoanType(e.target.value)} 
                    className="form-select"
                  >
                    {tenureOptions.map(t => (
                      <option key={t.label} value={t.label}>{t.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="select-icon" />
                </div>
              </div>

              {/* 6. PRINCIPAL (₹) */}
              <div className="form-group">
                <label className="input-label">Principal (₹)</label>
                <input 
                  type="number" 
                  value={principal} 
                  onChange={(e) => setPrincipal(e.target.value)} 
                  className="form-input" 
                  min="10000"
                  step="50000"
                />
              </div>

              {/* 7. ACTION BUTTON */}
              <button onClick={handleCompareClick} className="submit-btn">
                Compare against my income
              </button>
            </div>

            {/* RIGHT ANALYSIS DATA GRID DISPLAY */}
            <div className="display-panel">
              {confirmedProducts.length === 0 ? (
                <div className="profile-card" style={{ justifyContent: "center", padding: "48px 24px", textAlign: "center", background: "#f8fafc", flexDirection: "column", gap: "12px" }}>
                  <ShieldCheck size={36} color="#800020" style={{ margin: "0 auto" }} />
                  <p style={{ color: "#334155", fontWeight: "600", fontSize: "1.05rem" }}>
                    Multi-Bank Financial Stress Testing
                  </p>
                  <p style={{ color: "#64748b", fontWeight: "400", maxWidth: "480px", margin: "0 auto", fontSize: "0.9rem" }}>
                    Select your preferred bank category, bank, and target credit products on the left. Click &ldquo;Compare against my income&rdquo; to execute the FinTwin financial models.
                  </p>
                </div>
              ) : (
                <>
                  <div className="profile-card">
                    <div>
                      <span className="card-subtitle">Ecosystem Evaluation · {currentBank?.name}</span>
                      <div className="scenario-title">
                        <h2>{loanCategory}</h2>
                        <span className="dot">·</span>
                        <h2>₹{(Number(principal) / 100000).toFixed(2)} L</h2>
                        <span className="dot">·</span>
                        <h2 className="tenure">{loanTenureYears}y</h2>
                      </div>
                      <p className="income-note">
                        Your monthly income: <span className="highlight-text">₹{monthlyIncome.toLocaleString('en-IN')}</span> · Safe EMI cap: <span className="highlight-text">{safeEmiCapPercent}% (₹{(monthlyIncome * 0.4).toLocaleString('en-IN')}/mo)</span>
                      </p>
                      <p className="income-note" style={{ marginTop: '6px' }}>
                        Estimated CIBIL Score: <span style={{ fontWeight: 700, color: creditColor }}>{creditScore} — {creditLabel}</span>
                      </p>
                    </div>
                    {bestCard && (
                      <div className="best-emi-badge">
                        Optimal Configuration: ₹{bestCard.emi.toLocaleString('en-IN')}/Mo · {bestCard.name}
                      </div>
                    )}
                  </div>

                  <div className="cards-grid">
                    {calculatedCards.map((prod) => {
                      const isAffordable = Number(prod.pctOfIncome) <= safeEmiCapPercent;
                      return (
                        <div key={prod.id} className="bank-card">
                          <div className="card-top">
                            <div className="card-meta">
                              <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                                {prod.bankName}
                              </span>
                              <h3 className="card-bank-name" style={{ marginTop: "2px" }}>{prod.name}</h3>
                              <p className="card-bank-details">
                                Interest Rate: <span className="highlight-text">{prod.activeRate}% p.a.</span>
                              </p>
                            </div>
                            <span className="affordable-tag">
                              <Check className="tag-check" /> Verified Product
                            </span>
                          </div>

                          {prod.features && (
                            <p style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: "14px", lineHeight: "1.4" }}>
                              {prod.features}
                            </p>
                          )}

                          <div className="metrics-grid">
                            <div className="metric-box">
                              <span className="metric-label">EMI / Month</span>
                              <span className="metric-value">₹{prod.emi.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="metric-box">
                              <span className="metric-label">% of Income</span>
                              <span className="metric-value" style={{ color: isAffordable ? "#059669" : "#dc2626" }}>
                                {prod.pctOfIncome}%
                              </span>
                            </div>
                            <div className="metric-box">
                              <span className="metric-label">Total Payable</span>
                              <span className="metric-value">₹{(prod.totalPayable / 100000).toFixed(2)} L</span>
                            </div>
                            <div className="metric-box">
                              <span className="metric-label">Interest Paid</span>
                              <span className="metric-value">₹{(prod.interestPaid / 100000).toFixed(2)} L</span>
                            </div>
                          </div>

                          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                            {isAffordable ? (
                              <span style={{ fontSize: "0.78rem", fontWeight: "600", color: "#059669", display: "flex", alignItems: "center", gap: "4px" }}>
                                <Check size={14} /> Safe & Affordable for your income profile
                              </span>
                            ) : (
                              <span style={{ fontSize: "0.78rem", fontWeight: "600", color: "#dc2626", display: "flex", alignItems: "center", gap: "4px" }}>
                                <AlertCircle size={14} /> Exceeds safe 40% EMI limit — High debt burden
                              </span>
                            )}
                          </div>

                          <div className="card-footer">
                            <a href={prod.bankUrl} className="external-link" target="_blank" rel="noreferrer">
                              View Official {prod.bankName} Portal <ExternalLink className="link-icon" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          /* INVESTMENTS WORKSPACE CONTENT */
          <div className="investments-workspace" style={{ width: "100%" }}>
            <div className="profile-card">
              <div>
                <span className="card-subtitle">TAILORED WEALTH TARGETS</span>
                <div className="scenario-title" style={{ marginTop: "4px" }}>
                  <p className="income-note" style={{ fontSize: "1.1rem" }}>
                    Your horizon: <span className="highlight-text" style={{ fontWeight: "600" }}>{targetHorizon} years</span> 
                    <span className="dot" style={{ margin: "0 10px" }}>·</span> 
                    Risk Vector: <span className="highlight-text" style={{ fontWeight: "600" }}>{targetRisk.toUpperCase()}</span>
                    <span className="dot" style={{ margin: "0 10px" }}>·</span>
                    Active Bank: <span className="highlight-text" style={{ fontWeight: "600" }}>{currentBank?.name}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* BANK WEALTH SCHEMES SELECTOR */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ minWidth: "220px" }}>
                <label className="input-label" style={{ marginBottom: "4px" }}>Bank Category</label>
                <div className="select-wrapper">
                  <select 
                    value={bankCategory} 
                    onChange={handleBankCategoryChange}
                    className="form-select"
                    style={{ padding: "8px 12px", fontSize: "0.85rem" }}
                  >
                    {BANK_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <ChevronDown className="select-icon" />
                </div>
              </div>

              <div style={{ minWidth: "240px" }}>
                <label className="input-label" style={{ marginBottom: "4px" }}>Select Bank</label>
                <div className="select-wrapper">
                  <select 
                    value={selectedBankId} 
                    onChange={handleBankChange}
                    className="form-select"
                    style={{ padding: "8px 12px", fontSize: "0.85rem" }}
                  >
                    {banksInCategory.map(bank => (
                      <option key={bank.id} value={bank.id}>{bank.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="select-icon" />
                </div>
              </div>
            </div>

            {/* 1. BANK-LED WEALTH SCHEMES */}
            <h2 style={{ fontSize: "1.3rem", fontWeight: "600", margin: "16px 0 16px 0", color: "#1f2937" }}>
              {currentBank?.name} Curated Wealth & Deposit Schemes
            </h2>
            <div className="cards-grid">
              {(currentBank?.investments || []).map((scheme, index) => (
                <div key={index} className="bank-card">
                  <div className="card-top">
                    <div className="card-meta">
                      <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                        {currentBank?.name}
                      </span>
                      <h3 className="card-bank-name" style={{ fontSize: "1.05rem", marginTop: "2px" }}>{scheme.name}</h3>
                    </div>
                    {targetRisk.toLowerCase() === scheme.bestFitRisk?.toLowerCase() && (
                      <span className="affordable-tag" style={{ backgroundColor: "#ffedd5", color: "#ea580c" }}>
                        Algorithmic Fit
                      </span>
                    )}
                  </div>
                  <div className="metrics-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                    <div className="metric-box">
                      <span className="metric-label">PROSPECTUS RETURN</span>
                      <span className="metric-value" style={{ fontSize: "0.95rem" }}>{scheme.return}</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">TENURE LOCK-IN</span>
                      <span className="metric-value" style={{ fontSize: "0.95rem" }}>{scheme.lockIn}</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">SECURITY RISK</span>
                      <span className="metric-value" style={{ fontSize: "0.95rem" }}>{scheme.risk}</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">TAX STATUS</span>
                      <span className="metric-value" style={{ fontSize: "0.85rem" }}>{scheme.tax}</span>
                    </div>
                  </div>
                  <div className="card-footer">
                    <a href={currentBank?.url} target="_blank" rel="noreferrer" className="external-link" style={{ fontSize: "0.85rem", cursor: "pointer", textDecoration: "none" }}>
                      Open Account / Invest via {currentBank?.shortName || currentBank?.name} ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. UNIVERSAL STATUTORY GOVERNMENT SCHEMES */}
            <h2 style={{ fontSize: "1.3rem", fontWeight: "600", margin: "36px 0 16px 0", color: "#1f2937" }}>
              National Government-Sponsored Wealth & Savings Schemes
            </h2>
            <div className="cards-grid">
              {UNIVERSAL_GOVERNMENT_SCHEMES.map((scheme, index) => (
                <div key={index} className="bank-card">
                  <div className="card-top">
                    <div className="card-meta">
                      <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#059669", textTransform: "uppercase" }}>
                        GOVERNMENT OF INDIA STATUTORY
                      </span>
                      <h3 className="card-bank-name" style={{ fontSize: "1.05rem", marginTop: "2px" }}>{scheme.name}</h3>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "#64748b", margin: "8px 0 12px 0", lineHeight: "1.4" }}>
                    {scheme.desc}
                  </p>
                  <div className="metrics-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="metric-box">
                      <span className="metric-label">SOVEREIGN RETURN</span>
                      <span className="metric-value" style={{ fontSize: "0.95rem" }}>{scheme.return}</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">TENURE LOCK-IN</span>
                      <span className="metric-value" style={{ fontSize: "0.95rem" }}>{scheme.lockIn}</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">SECURITY RISK</span>
                      <span className="metric-value" style={{ fontSize: "0.95rem" }}>{scheme.risk}</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">TAX PROVISION</span>
                      <span className="metric-value" style={{ fontSize: "0.85rem" }}>{scheme.tax}</span>
                    </div>
                  </div>
                  <div className="card-footer">
                    <a href={currentBank?.url} target="_blank" rel="noreferrer" className="external-link" style={{ fontSize: "0.85rem", cursor: "pointer", textDecoration: "none" }}>
                      Subscribe Scheme via {currentBank?.name} Portal ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
