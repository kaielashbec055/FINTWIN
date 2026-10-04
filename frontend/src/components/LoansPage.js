/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  CreditCard, 
  Landmark, 
  Clock, 
  Trash2, 
  Check, 
  ExternalLink, 
  ChevronDown, 
  ShieldCheck, 
  AlertCircle,
  TrendingDown,
  Calendar,
  X
} from 'lucide-react';
import './LoansPage.css';
import './LoansAndInvestments.css'; // Inherits the card styles from visual reference
import {
  BANK_CATEGORIES,
  LOAN_CATEGORIES,
  LOAN_TENURE_OPTIONS,
  DEFAULT_PRINCIPALS,
  BANKS_DATA
} from '../data/banksData';
import { useLanguage } from '../context/LanguageContext';

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

export default function LoansPage({ profile }) {
  const { t } = useLanguage();
  const [subTab, setSubTab] = useState('my_loans'); // 'my_loans' | 'explore'

  // ==========================================
  // 1. ACTIVE USER LOANS STATE & STORAGE
  // ==========================================
  const [userLoans, setUserLoans] = useState(() => {
    try {
      const saved = localStorage.getItem("fintwin_user_loans");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Realistic initial dummy loan records
    return [
      {
        id: "loan_1",
        name: "SBI Regular Home Loan - 2BHK Apartment",
        bank: "State Bank of India (SBI)",
        type: "Home Loan",
        principal: 3500000,
        outstanding: 2840000,
        rate: 8.50,
        emi: 30371,
        totalTenureYears: 20,
        remainingTenureYears: 16,
        status: "Active",
        startDate: "2022-03-15"
      },
      {
        id: "loan_2",
        name: "HDFC Custom Car Loan - SUV",
        bank: "HDFC Bank",
        type: "Vehicle Loan",
        principal: 950000,
        outstanding: 420000,
        rate: 8.80,
        emi: 19630,
        totalTenureYears: 5,
        remainingTenureYears: 2,
        status: "Active",
        startDate: "2023-08-10"
      },
      {
        id: "loan_3",
        name: "ICICI Insta Personal Credit",
        bank: "ICICI Bank",
        type: "Personal Loan",
        principal: 300000,
        outstanding: 110000,
        rate: 10.60,
        emi: 6464,
        totalTenureYears: 5,
        remainingTenureYears: 1.5,
        status: "Active",
        startDate: "2023-01-20"
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("fintwin_user_loans", JSON.stringify(userLoans));
  }, [userLoans]);

  // Modal State for Add Loan
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLoan, setNewLoan] = useState({
    name: "",
    bank: "State Bank of India (SBI)",
    type: "Home Loan",
    principal: 2000000,
    outstanding: 2000000,
    rate: 8.50,
    totalTenureYears: 15,
    remainingTenureYears: 15,
    status: "Active"
  });

  // Handle Add Loan submission
  const handleAddLoanSubmit = (e) => {
    e.preventDefault();
    if (!newLoan.name.trim()) return alert("Please enter a loan name");

    const P = parseFloat(newLoan.principal) || 0;
    const rate = parseFloat(newLoan.rate) || 8.5;
    const years = parseFloat(newLoan.totalTenureYears) || 10;
    const metrics = calculateLoanMetrics(P, rate, years, monthlyIncome);

    const loanEntry = {
      id: `loan_${Date.now()}`,
      name: newLoan.name,
      bank: newLoan.bank,
      type: newLoan.type,
      principal: P,
      outstanding: parseFloat(newLoan.outstanding) || P,
      rate: rate,
      emi: metrics.emi,
      totalTenureYears: years,
      remainingTenureYears: parseFloat(newLoan.remainingTenureYears) || years,
      status: newLoan.status || "Active",
      startDate: new Date().toISOString().split('T')[0]
    };

    setUserLoans(prev => [loanEntry, ...prev]);
    setIsAddModalOpen(false);
    setNewLoan({
      name: "",
      bank: "State Bank of India (SBI)",
      type: "Home Loan",
      principal: 2000000,
      outstanding: 2000000,
      rate: 8.50,
      totalTenureYears: 15,
      remainingTenureYears: 15,
      status: "Active"
    });
  };

  const handleDeleteLoan = (id) => {
    if (window.confirm("Are you sure you want to remove this loan record?")) {
      setUserLoans(prev => prev.filter(l => l.id !== id));
    }
  };

  // Summary calculations
  const totalOutstanding = userLoans.reduce((sum, l) => sum + (Number(l.outstanding) || 0), 0);
  const totalBorrowed = userLoans.reduce((sum, l) => sum + (Number(l.principal) || 0), 0);
  const totalMonthlyEMI = userLoans.reduce((sum, l) => sum + (Number(l.emi) || 0), 0);

  // ==========================================
  // 2. EXPLORE & COMPARE BANK LOANS STATE
  // ==========================================
  const [bankCategory, setBankCategory] = useState("Public Sector Banks");
  const [selectedBankId, setSelectedBankId] = useState("SBI");
  const [loanCategory, setLoanCategory] = useState("Housing Loans");

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [confirmedProducts, setConfirmedProducts] = useState([]);

  const [loanType, setLoanType] = useState('Home Loan (30y)');
  const [principal, setPrincipal] = useState(2500000);

  const userEmail = localStorage.getItem("userEmail") || "user";
  const storedIncome = localStorage.getItem(`${userEmail}_totalIncome`);
  const monthlyIncome = Number(profile?.monthlyIncome || profile?.totalIncome || storedIncome || 50000);

  const targetRisk = profile?.riskTolerance || localStorage.getItem(`${userEmail}_riskTolerance`) || "medium";
  const safeEmiCapPercent = 40;

  const creditScore = targetRisk.toLowerCase() === "low" ? 780 
    : targetRisk.toLowerCase() === "high" ? 650 
    : 720;
  const creditLabel = creditScore >= 750 ? "Excellent" : creditScore >= 700 ? "Good" : "Fair";
  const creditColor = creditScore >= 750 ? "#10b981" : creditScore >= 700 ? "#f59e0b" : "#ef4444";

  const banksInCategory = BANKS_DATA[bankCategory] || [];
  const currentBank = banksInCategory.find(b => b.id === selectedBankId) || banksInCategory[0] || null;

  useEffect(() => {
    if (currentBank) {
      localStorage.setItem("fintwin_selected_bank", currentBank.name);
      localStorage.setItem("fintwin_selected_bank_category", bankCategory);
    }
  }, [currentBank, bankCategory]);

  const availableProducts = (currentBank?.loans && currentBank.loans[loanCategory]) || [];
  const tenureOptions = LOAN_TENURE_OPTIONS[loanCategory] || [{ label: "Term (5y)", years: 5 }];
  const activeTenureObj = tenureOptions.find(t => t.label === loanType) || tenureOptions[0];
  const loanTenureYears = activeTenureObj ? activeTenureObj.years : 5;

  const handleBankCategoryChange = (e) => {
    const newCategory = e.target.value;
    setBankCategory(newCategory);
    const newBanks = BANKS_DATA[newCategory] || [];
    if (newBanks.length > 0) setSelectedBankId(newBanks[0].id);
    setSelectedProducts([]);
    setConfirmedProducts([]);
  };

  const handleBankChange = (e) => {
    setSelectedBankId(e.target.value);
    setSelectedProducts([]);
    setConfirmedProducts([]);
  };

  const handleLoanCategoryChange = (e) => {
    const newCat = e.target.value;
    setLoanCategory(newCat);
    setSelectedProducts([]);
    setConfirmedProducts([]);
    const newTenures = LOAN_TENURE_OPTIONS[newCat] || [];
    if (newTenures.length > 0) setLoanType(newTenures[0].label);
    if (DEFAULT_PRINCIPALS[newCat]) setPrincipal(DEFAULT_PRINCIPALS[newCat]);
  };

  const toggleProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    if (selectedProducts.length === 0) {
      alert("Please select at least 1 loan product checkbox first!");
      return;
    }
    setConfirmedProducts([...selectedProducts]);
  };

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
    <div className="loans-page-container">
      {/* HEADER BLOCK */}
      <div className="loans-header-block">
        <div>
          <span className="subtitle">{t("loans_subtitle", "Multi-Bank Credit & Repayment Architecture")}</span>
          <h1 className="title">{t("loans_title", "Loans & Liabilities")}</h1>
          <p className="description">
            Track and manage your active loan obligations, monitor remaining tenures, and evaluate new loan products across 5 Indian banking categories with real-time income stress testing.
          </p>
        </div>

        <button className="primary-add-btn" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} /> {t("loans_add_loan", "Add Loan")}
        </button>
      </div>

      {/* TOP METRICS SUMMARY CARDS */}
      <div className="loans-summary-grid">
        <div className="loan-metric-card">
          <div className="loan-metric-card-label">{t("loans_total_debt", "Total Outstanding Debt")}</div>
          <div className="loan-metric-card-val" style={{ color: "#dc2626" }}>
            ₹{(totalOutstanding / 100000).toFixed(2)} L
          </div>
          <div className="loan-metric-card-sub">Active principal balance</div>
        </div>

        <div className="loan-metric-card">
          <div className="loan-metric-card-label">{t("loans_monthly_emi", "Total Monthly EMI")}</div>
          <div className="loan-metric-card-val" style={{ color: "#0f172a" }}>
            ₹{totalMonthlyEMI.toLocaleString('en-IN')}
          </div>
          <div className="loan-metric-card-sub">
            {monthlyIncome > 0 ? `${((totalMonthlyEMI / monthlyIncome) * 100).toFixed(1)}% of your monthly income` : "Monthly obligation"}
          </div>
        </div>

        <div className="loan-metric-card">
          <div className="loan-metric-card-label">{t("loans_total_borrowed", "Total Borrowed")}</div>
          <div className="loan-metric-card-val">
            ₹{(totalBorrowed / 100000).toFixed(2)} L
          </div>
          <div className="loan-metric-card-sub">Initial sanction amount</div>
        </div>

        <div className="loan-metric-card">
          <div className="loan-metric-card-label">{t("loans_active_count", "Active Loans")}</div>
          <div className="loan-metric-card-val" style={{ color: "#800020" }}>
            {userLoans.length}
          </div>
          <div className="loan-metric-card-sub">Registered liabilities</div>
        </div>
      </div>

      {/* SUB TABS NAVIGATION */}
      <div className="loans-subnav-tabs">
        <button 
          className={`loans-subnav-btn ${subTab === 'my_loans' ? 'active' : ''}`}
          onClick={() => setSubTab('my_loans')}
        >
          <CreditCard size={16} /> {t("loans_tab_my_loans", "My Active Loans")} ({userLoans.length})
        </button>
        <button 
          className={`loans-subnav-btn ${subTab === 'explore' ? 'active' : ''}`}
          onClick={() => setSubTab('explore')}
        >
          <Landmark size={16} /> {t("loans_tab_explore", "Explore & Compare Bank Loan Products")}
        </button>
      </div>

      {/* TAB 1: MY ACTIVE LOANS */}
      {subTab === 'my_loans' && (
        <div>
          {userLoans.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 16px", background: "#f8fafc", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
              <CreditCard size={40} color="#94a3b8" style={{ margin: "0 auto 12px auto" }} />
              <h3 style={{ fontSize: "1.1rem", color: "#334155", margin: "0 0 6px 0" }}>No Active Loans Registered</h3>
              <p style={{ color: "#64748b", fontSize: "0.88rem", maxWidth: "420px", margin: "0 auto 16px auto" }}>
                Add your current home, personal, or vehicle loans to monitor repayments, outstanding balances, and debt-to-income impact.
              </p>
              <button className="primary-add-btn" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={16} /> Add Loan
              </button>
            </div>
          ) : (
            <div className="active-loans-grid">
              {userLoans.map(loan => {
                const paidAmount = Math.max(0, loan.principal - loan.outstanding);
                const progressPct = loan.principal > 0 ? Math.min(100, Math.round((paidAmount / loan.principal) * 100)) : 0;
                return (
                  <div key={loan.id} className="active-loan-card">
                    <div>
                      <div className="active-loan-top">
                        <div className="active-loan-title-group">
                          <span className="active-loan-bank-pill">{loan.bank}</span>
                          <h3 style={{ marginTop: "6px" }}>{loan.name}</h3>
                          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>{loan.type}</span>
                        </div>
                        <span className={`active-loan-status-tag ${loan.status === 'Active' ? 'status-active' : 'status-review'}`}>
                          {loan.status}
                        </span>
                      </div>

                      <div className="loan-progress-box">
                        <div className="progress-labels">
                          <span>Repayment Progress</span>
                          <span style={{ fontWeight: 700, color: "#800020" }}>{progressPct}% Paid</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${progressPct}%` }}></div>
                        </div>
                      </div>

                      <div className="active-loan-stats-grid">
                        <div className="active-loan-stat-item">
                          <span>{t("loans_outstanding", "Outstanding")}</span>
                          <span style={{ color: "#dc2626" }}>₹{(loan.outstanding / 100000).toFixed(2)} L</span>
                        </div>
                        <div className="active-loan-stat-item">
                          <span>{t("loans_emi", "Monthly EMI")}</span>
                          <span>₹{loan.emi.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="active-loan-stat-item">
                          <span>{t("loans_rate", "Interest Rate")}</span>
                          <span>{loan.rate}% p.a.</span>
                        </div>
                        <div className="active-loan-stat-item">
                          <span>{t("loans_tenure_remaining", "Tenure Left")}</span>
                          <span>{loan.remainingTenureYears} Years</span>
                        </div>
                      </div>
                    </div>

                    <div className="active-loan-footer">
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Calendar size={13} /> Started {loan.startDate || "Active"}
                      </div>
                      <button 
                        className="loan-action-delete-btn" 
                        onClick={() => handleDeleteLoan(loan.id)}
                        title="Delete this loan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXPLORE & COMPARE BANK LOAN PRODUCTS */}
      {subTab === 'explore' && (
        <div className="workspace-layout">
          {/* LEFT SELECTION COLUMN FORM (Matching reference visual style) */}
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
                    No products listed for this category.
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
                        <span className="bank-name">{prod.name}</span>
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
              {t("loans_compare_btn", "Compare against my income")}
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
                  Select your bank category, bank, and target credit products on the left. Click &ldquo;Compare against my income&rdquo; to execute the FinTwin financial models.
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
                            <span className="metric-label">{t("loans_emi", "EMI / Month")}</span>
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
        </div>
      )}

      {/* ADD LOAN MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Active Loan Record</h2>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddLoanSubmit} className="modal-form-grid">
              <div className="modal-input-group full-width">
                <label>Loan Name / Purpose</label>
                <input 
                  type="text" 
                  placeholder="e.g. SBI Regular Home Loan - Bandra Flat" 
                  value={newLoan.name}
                  onChange={(e) => setNewLoan({ ...newLoan, name: e.target.value })}
                  required
                />
              </div>

              <div className="modal-input-group">
                <label>Lending Bank / Institution</label>
                <select 
                  value={newLoan.bank}
                  onChange={(e) => setNewLoan({ ...newLoan, bank: e.target.value })}
                >
                  <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Bank of Baroda">Bank of Baroda</option>
                  <option value="Punjab National Bank (PNB)">Punjab National Bank (PNB)</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  <option value="Canara Bank">Canara Bank</option>
                  <option value="IDBI Bank">IDBI Bank</option>
                  <option value="AU Small Finance Bank">AU Small Finance Bank</option>
                  <option value="Saraswat Co-op Bank">Saraswat Co-op Bank</option>
                  <option value="Other Bank / NBFC">Other Bank / NBFC</option>
                </select>
              </div>

              <div className="modal-input-group">
                <label>Loan Category</label>
                <select 
                  value={newLoan.type}
                  onChange={(e) => setNewLoan({ ...newLoan, type: e.target.value })}
                >
                  <option value="Home Loan">Home Loan</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Vehicle Loan">Vehicle Loan</option>
                  <option value="Education Loan">Education Loan</option>
                  <option value="Business Loan">Business Loan</option>
                  <option value="Gold Loan">Gold Loan</option>
                  <option value="Loan Against Property">Loan Against Property</option>
                </select>
              </div>

              <div className="modal-input-group">
                <label>Principal Amount (₹)</label>
                <input 
                  type="number" 
                  value={newLoan.principal}
                  onChange={(e) => setNewLoan({ ...newLoan, principal: e.target.value })}
                  min="10000"
                  required
                />
              </div>

              <div className="modal-input-group">
                <label>Current Outstanding (₹)</label>
                <input 
                  type="number" 
                  value={newLoan.outstanding}
                  onChange={(e) => setNewLoan({ ...newLoan, outstanding: e.target.value })}
                  min="0"
                  required
                />
              </div>

              <div className="modal-input-group">
                <label>Interest Rate (% p.a.)</label>
                <input 
                  type="number" 
                  step="0.05"
                  value={newLoan.rate}
                  onChange={(e) => setNewLoan({ ...newLoan, rate: e.target.value })}
                  required
                />
              </div>

              <div className="modal-input-group">
                <label>Total Tenure (Years)</label>
                <input 
                  type="number" 
                  value={newLoan.totalTenureYears}
                  onChange={(e) => setNewLoan({ ...newLoan, totalTenureYears: e.target.value })}
                  min="1"
                  required
                />
              </div>

              <div className="modal-input-group">
                <label>Remaining Tenure (Years)</label>
                <input 
                  type="number" 
                  step="0.5"
                  value={newLoan.remainingTenureYears}
                  onChange={(e) => setNewLoan({ ...newLoan, remainingTenureYears: e.target.value })}
                  min="0.5"
                  required
                />
              </div>

              <div className="modal-input-group">
                <label>Status</label>
                <select 
                  value={newLoan.status}
                  onChange={(e) => setNewLoan({ ...newLoan, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="In Grace Period">In Grace Period</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="modal-actions-footer full-width">
                <button type="button" className="modal-cancel-btn" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-save-btn">
                  Save Loan Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
