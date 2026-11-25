import React, { useState, useEffect } from "react";
import "./Profile.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  UserCheck,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  Calendar,
  Phone,
  Briefcase,
  MapPin,
  Users,
  Target,
  TrendingUp,
  Wallet,
  CheckCircle2,
  Check
} from "lucide-react";

function FinancialProfile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showFormOnly, setShowFormOnly] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    phone: "",
    occupation: "",
    employmentType: "salaried",
    city: "",
    dependents: "",
    monthlyIncome: "",
    monthlyExpenses: "",
    riskTolerance: "medium",
    investmentTimeline: "",
    financialGoals: "",
  });

  useEffect(() => {
    const checkUserProfileOnBackend = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const isExplicitEdit = searchParams.get("edit") === "true";

      try {
        const config = {
          headers: { 
            "x-auth-token": token,
            "Authorization": `Bearer ${token}` 
          }
        };
        
        let res;
        try {
          res = await axios.get("http://localhost:5000/api/profile", { ...config, timeout: 2500 });
        } catch (localErr) {
          res = await axios.get("https://wealth-ai-backend.onrender.com/api/profile", config);
        }
        
        const userEmail = (localStorage.getItem("userEmail") || "user").toLowerCase().trim();
        const storedName = localStorage.getItem("userName") || localStorage.getItem(`${userEmail}_name`) || "";
        const localCompleted = localStorage.getItem(`${userEmail}_profileCompleted`) === "true" || localStorage.getItem("profileCompleted") === "true";

        if (res.data && Object.keys(res.data).length > 0 && (res.data.profileCompleted || res.data.monthlyIncome || localCompleted)) {
          setIsEditing(true);
          // Registered user who already has a completed twin profile:
          // Display the 2-box selection screen unless explicitly requested edit view (?edit=true)
          setShowFormOnly(isExplicitEdit);

          setFormData({
            name: res.data.name || storedName || "",
            age: res.data.age || localStorage.getItem(`${userEmail}_age`) || "",
            phone: res.data.phone || localStorage.getItem(`${userEmail}_phone`) || "",
            occupation: res.data.occupation || localStorage.getItem(`${userEmail}_occupation`) || "",
            employmentType: res.data.employmentType || localStorage.getItem(`${userEmail}_employmentType`) || "salaried",
            city: res.data.city || localStorage.getItem(`${userEmail}_city`) || "",
            dependents: res.data.dependents || localStorage.getItem(`${userEmail}_dependents`) || "",
            monthlyIncome: res.data.monthlyIncome || localStorage.getItem(`${userEmail}_totalIncome`) || "",
            monthlyExpenses: res.data.monthlyExpenses || localStorage.getItem(`${userEmail}_totalExpenses`) || "",
            riskTolerance: res.data.riskTolerance || localStorage.getItem(`${userEmail}_riskTolerance`) || "medium",
            investmentTimeline: res.data.investmentTimeline || localStorage.getItem(`${userEmail}_investmentHorizon`) || "",
            financialGoals: res.data.financialGoals || localStorage.getItem(`${userEmail}_financialGoal`) || "",
          });
        } else {
          // New user who has NOT completed a profile yet:
          // Directly open profile creation form. Do NOT show the 2-box selection screen.
          setIsEditing(false);
          setShowFormOnly(true);
          setFormData(prev => ({
            ...prev,
            name: storedName || prev.name,
            age: localStorage.getItem(`${userEmail}_age`) || prev.age,
            phone: localStorage.getItem(`${userEmail}_phone`) || prev.phone,
            occupation: localStorage.getItem(`${userEmail}_occupation`) || prev.occupation,
            employmentType: localStorage.getItem(`${userEmail}_employmentType`) || prev.employmentType,
            city: localStorage.getItem(`${userEmail}_city`) || prev.city,
            dependents: localStorage.getItem(`${userEmail}_dependents`) || prev.dependents,
            monthlyIncome: localStorage.getItem(`${userEmail}_totalIncome`) || prev.monthlyIncome,
            monthlyExpenses: localStorage.getItem(`${userEmail}_totalExpenses`) || prev.monthlyExpenses,
            riskTolerance: localStorage.getItem(`${userEmail}_riskTolerance`) || prev.riskTolerance,
            investmentTimeline: localStorage.getItem(`${userEmail}_investmentHorizon`) || prev.investmentTimeline,
            financialGoals: localStorage.getItem(`${userEmail}_financialGoal`) || prev.financialGoals,
          }));
        }
      } catch (err) {
        console.log("No profile on backend or error, moving to registration form");
        const userEmail = (localStorage.getItem("userEmail") || "user").toLowerCase().trim();
        const hasExisting = localStorage.getItem(`${userEmail}_profileCompleted`) === "true" || localStorage.getItem("profileCompleted") === "true";
        if (hasExisting) {
          setIsEditing(true);
          setShowFormOnly(isExplicitEdit);
        } else {
          setIsEditing(false);
          setShowFormOnly(true); // New user lands directly on form!
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkUserProfileOnBackend();
  }, [navigate]);

  const handleGoToHome = () => {
    sessionStorage.removeItem("justLoggedIn");
    navigate("/homepage", { replace: true });
  };

  const handleCreateNewProfile = () => {
    sessionStorage.removeItem("justLoggedIn");
    setFormData(prev => ({
      name: localStorage.getItem("userName") || prev.name || "",
      age: "",
      phone: "",
      occupation: "",
      employmentType: "salaried",
      city: "",
      dependents: "",
      monthlyIncome: "",
      monthlyExpenses: "",
      riskTolerance: "medium",
      investmentTimeline: "",
      financialGoals: "",
    }));
    setIsEditing(false);
    setShowFormOnly(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSetRiskTolerance = (level) => {
    setFormData(prev => ({ ...prev, riskTolerance: level }));
  };

  const handleApplyGoalSuggestion = (goalText) => {
    setFormData(prev => ({ ...prev, financialGoals: goalText }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const userEmail = (localStorage.getItem("userEmail") || "user").toLowerCase().trim();

    const payload = {
      name: formData.name,
      age: formData.age,
      phone: formData.phone,
      occupation: formData.occupation,
      employmentType: formData.employmentType,
      city: formData.city,
      dependents: formData.dependents,
      monthlyIncome: formData.monthlyIncome,
      monthlyExpenses: formData.monthlyExpenses,
      riskTolerance: formData.riskTolerance,
      investmentTimeline: formData.investmentTimeline,
      financialGoals: formData.financialGoals,
      profileCompleted: true
    };

    try {
      const config = { 
        headers: { 
          "x-auth-token": token,
          "Authorization": `Bearer ${token}` 
        } 
      };

      if (isEditing) {
        try {
          await axios.put("http://localhost:5000/api/profile", payload, { ...config, timeout: 2500 });
        } catch (localErr) {
          await axios.put("https://wealth-ai-backend.onrender.com/api/profile", payload, config);
        }
      } else {
        try {
          await axios.post("http://localhost:5000/api/profile", payload, { ...config, timeout: 2500 });
        } catch (localErr) {
          await axios.post("https://wealth-ai-backend.onrender.com/api/profile", payload, config);
        }
      }

      localStorage.setItem("userName", formData.name);
      localStorage.setItem(`${userEmail}_name`, formData.name);
      localStorage.setItem(`${userEmail}_age`, formData.age);
      localStorage.setItem(`${userEmail}_phone`, formData.phone);
      localStorage.setItem(`${userEmail}_occupation`, formData.occupation);
      localStorage.setItem(`${userEmail}_employmentType`, formData.employmentType);
      localStorage.setItem(`${userEmail}_city`, formData.city);
      localStorage.setItem(`${userEmail}_dependents`, formData.dependents);
      localStorage.setItem(`${userEmail}_totalIncome`, formData.monthlyIncome);
      localStorage.setItem(`${userEmail}_totalExpenses`, formData.monthlyExpenses);
      localStorage.setItem(`${userEmail}_riskTolerance`, formData.riskTolerance);
      localStorage.setItem(`${userEmail}_investmentHorizon`, formData.investmentTimeline);
      localStorage.setItem(`${userEmail}_financialGoal`, formData.financialGoals);
      localStorage.setItem("profileCompleted", "true");
      localStorage.setItem(`${userEmail}_profileCompleted`, "true");

      alert("Profile Saved Successfully");
      navigate("/homepage", { replace: true });

    } catch (error) {
      alert(error.response?.data?.msg || "Error processing profile data payload");
    }
  };

  if (isLoading) {
    return null; 
  }

  // 1. TWO-BOX SELECTION VIEW (WHEN A REGISTERED USER ENTERS THE ACCOUNT)
  if (!showFormOnly) {
    return (
      <div className="welcome-container">
        <div className="welcome-card">
          <div className="welcome-top-nav">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="btn-back-options"
              title="Return to landing page"
            >
              <ArrowLeft size={15} style={{ marginRight: 6 }} /> Back
            </button>
          </div>
          <div className="welcome-header">
            <span className="welcome-badge">
              <Sparkles size={14} className="badge-sparkle-icon" /> FINTWIN PORTAL
            </span>
            <h1 className="welcome-title">Welcome Back</h1>
            <p className="welcome-subtitle">
              Please select an action layout option to continue.
            </p>
          </div>

          <div className="selection-grid">
            {/* Box 1 (Left): already registered? click here */}
            <div className="option-box left-box" onClick={handleGoToHome}>
              <div className="option-top-row">
                <span className="box-pill-badge existing">EXISTING USER</span>
                <span className="box-step-indicator">Direct Access</span>
              </div>
              <div className="option-icon-wrapper existing-glow">
                <div className="option-icon existing">
                  <UserCheck size={28} />
                </div>
              </div>
              <div className="option-content">
                <h2 className="option-title">already registered? click here</h2>
                <p className="option-description">
                  Skip configuration steps and go straight to your live dashboard view with real-time portfolio, loans, and scheme matching.
                </p>
                <div className="box-perks">
                  <div className="box-perk-item">
                    <CheckCircle2 size={14} className="perk-icon" />
                    <span>Instant access to personalized dashboard</span>
                  </div>
                  <div className="box-perk-item">
                    <CheckCircle2 size={14} className="perk-icon" />
                    <span>Verified bank & government scheme matching</span>
                  </div>
                </div>
              </div>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); handleGoToHome(); }} 
                className="btn btn-primary"
              >
                <span>go to home</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Box 2 (Right side): are you a new user create profile */}
            <div className="option-box right-box active-border" onClick={handleCreateNewProfile}>
              <div className="option-top-row">
                <span className="box-pill-badge new">NEW PROFILE</span>
                <span className="box-step-indicator">Twin Setup</span>
              </div>
              <div className="option-icon-wrapper new-glow">
                <div className="option-icon new">
                  <UserPlus size={28} />
                </div>
              </div>
              <div className="option-content">
                <h2 className="option-title">are you a new user create profile</h2>
                <p className="option-description">
                  Overwrite parameter history logs and build a new configuration model with your income, expenses, and wealth goals.
                </p>
                <div className="box-perks">
                  <div className="box-perk-item">
                    <CheckCircle2 size={14} className="perk-icon" />
                    <span>Step-by-step financial model configuration</span>
                  </div>
                  <div className="box-perk-item">
                    <CheckCircle2 size={14} className="perk-icon" />
                    <span>Deterministic loan eligibility & SIP projections</span>
                  </div>
                </div>
              </div>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); handleCreateNewProfile(); }} 
                className="btn btn-secondary"
              >
                <span>create a new profile</span>
                <Sparkles size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. ENHANCED PROFILE CREATION & CONFIGURATION FORM VIEW
  const incomeVal = parseFloat(formData.monthlyIncome) || 0;
  const expensesVal = parseFloat(formData.monthlyExpenses) || 0;
  const netSurplus = incomeVal - expensesVal;
  const savingsRatio = incomeVal > 0 ? Math.round((netSurplus / incomeVal) * 100) : 0;

  return (
    <div className="profile-page-bg">
      <div className="profile-container form-view">
        {/* Modern Form Navigation & Header */}
        <div className="form-header-modern">
          <div className="form-header-left">
            <span className="meta-badge-pill">
              <Sparkles size={13} style={{ marginRight: 6 }} /> PROFILE CONFIGURATION
            </span>
            <h2 className="form-main-heading">Tell FinTwin about you.</h2>
            <p className="sub-instruction-text">
              These numbers stay with you. They power every suggestion we make — loans, schemes, EMI checks.
            </p>
          </div>
          <div className="form-header-actions">
            <button
              type="button"
              onClick={() => {
                if (isEditing) {
                  setShowFormOnly(false);
                } else {
                  navigate("/");
                }
              }}
              className="btn-back-options"
              title="Return"
            >
              <ArrowLeft size={15} style={{ marginRight: 6 }} /> Back
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form-modern">
          {/* SECTION 1: PERSONAL & DEMOGRAPHICS */}
          <div className="form-section-card">
            <div className="section-card-header">
              <div className="section-icon-bubble">
                <User size={18} />
              </div>
              <div>
                <h3 className="section-title">Personal Details</h3>
                <p className="section-subtitle">Identity and demographic parameters for profile matching</p>
              </div>
            </div>

            <div className="profile-box-grid">
              <div className="input-group full-width">
                <label className="field-label">Full Name <span className="required-star">*</span></label>
                <div className="input-icon-wrapper">
                  <User size={16} className="field-prefix-icon" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="styled-input with-prefix"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="field-label">Age <span className="required-star">*</span></label>
                <div className="input-icon-wrapper">
                  <Calendar size={16} className="field-prefix-icon" />
                  <input
                    type="number"
                    name="age"
                    placeholder="e.g. 28"
                    value={formData.age}
                    onChange={handleChange}
                    className="styled-input with-prefix"
                    min="18"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="field-label">Phone <span className="optional-tag">(optional)</span></label>
                <div className="input-icon-wrapper">
                  <Phone size={16} className="field-prefix-icon" />
                  <input
                    type="text"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="styled-input with-prefix"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="field-label">City / State <span className="required-star">*</span></label>
                <div className="input-icon-wrapper">
                  <MapPin size={16} className="field-prefix-icon" />
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. Mumbai, Maharashtra"
                    value={formData.city}
                    onChange={handleChange}
                    className="styled-input with-prefix"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="field-label">Dependents <span className="required-star">*</span></label>
                <div className="input-icon-wrapper">
                  <Users size={16} className="field-prefix-icon" />
                  <input
                    type="number"
                    name="dependents"
                    placeholder="0"
                    value={formData.dependents}
                    onChange={handleChange}
                    className="styled-input with-prefix"
                    min="0"
                    max="15"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: PROFESSIONAL & MONTHLY CASH FLOW */}
          <div className="form-section-card">
            <div className="section-card-header">
              <div className="section-icon-bubble">
                <Wallet size={18} />
              </div>
              <div>
                <h3 className="section-title">Income & Cash Flow</h3>
                <p className="section-subtitle">Monthly earnings and routine expenses to calculate debt serviceability</p>
              </div>
            </div>

            <div className="profile-box-grid">
              <div className="input-group">
                <label className="field-label">Occupation <span className="required-star">*</span></label>
                <div className="input-icon-wrapper">
                  <Briefcase size={16} className="field-prefix-icon" />
                  <input
                    type="text"
                    name="occupation"
                    placeholder="e.g. Software Engineer, Doctor, Trader"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="styled-input with-prefix"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="field-label">Employment Type <span className="required-star">*</span></label>
                <div className="select-wrapper-modern">
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                    className="styled-select"
                    required
                  >
                    <option value="salaried">Salaried (Private / Govt)</option>
                    <option value="self-employed">Self-Employed / Professional</option>
                    <option value="business">Business Owner / MSME</option>
                    <option value="student">Student</option>
                    <option value="unemployed">Unemployed</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="field-label">Monthly Income (₹) <span className="required-star">*</span></label>
                <div className="currency-input-wrapper">
                  <span className="currency-symbol-tag">₹</span>
                  <input
                    type="number"
                    name="monthlyIncome"
                    placeholder="e.g. 75000"
                    value={formData.monthlyIncome}
                    onChange={handleChange}
                    className="styled-input with-currency"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="field-label">Monthly Expenses (₹) <span className="required-star">*</span></label>
                <div className="currency-input-wrapper">
                  <span className="currency-symbol-tag">₹</span>
                  <input
                    type="number"
                    name="monthlyExpenses"
                    placeholder="e.g. 35000"
                    value={formData.monthlyExpenses}
                    onChange={handleChange}
                    className="styled-input with-currency"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* LIVE CASH FLOW INSIGHT STRIP */}
            {(incomeVal > 0 || expensesVal > 0) && (
              <div className="cashflow-insight-banner">
                <div className="cashflow-metric">
                  <span className="metric-label">Estimated Monthly Surplus</span>
                  <span className={`metric-val ${netSurplus >= 0 ? 'positive' : 'negative'}`}>
                    ₹{Math.abs(netSurplus).toLocaleString("en-IN")} {netSurplus < 0 ? '(Deficit)' : ''}
                  </span>
                </div>
                <div className="cashflow-divider"></div>
                <div className="cashflow-metric">
                  <span className="metric-label">Savings Ratio</span>
                  <span className={`metric-val ${savingsRatio >= 20 ? 'healthy' : 'moderate'}`}>
                    {savingsRatio}% of income
                  </span>
                </div>
                <div className="cashflow-divider"></div>
                <div className="cashflow-summary-tag">
                  {netSurplus > 0 
                    ? "✓ Strong surplus available for SIP compounding and loan eligibility." 
                    : "⚠ Monthly expenses equal or exceed income. Advisory will recommend expense rationalization."}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: WEALTH GOALS & RISK APPETITE */}
          <div className="form-section-card">
            <div className="section-card-header">
              <div className="section-icon-bubble">
                <Target size={18} />
              </div>
              <div>
                <h3 className="section-title">Wealth Goals & Risk Profile</h3>
                <p className="section-subtitle">Determine your investment temperament and planning horizon</p>
              </div>
            </div>

            <div className="profile-box-grid">
              <div className="input-group full-width">
                <label className="field-label">Risk Appetite <span className="required-star">*</span></label>
                <div className="risk-selector-grid">
                  <div 
                    className={`risk-card ${formData.riskTolerance === 'low' ? 'selected' : ''}`}
                    onClick={() => handleSetRiskTolerance('low')}
                  >
                    <div className="risk-card-top">
                      <span className="risk-title">Low (Conservative)</span>
                      {formData.riskTolerance === 'low' && <Check size={16} className="risk-check" />}
                    </div>
                    <p className="risk-desc">Capital protection priority. Fixed deposits, sovereign bonds, debt instruments.</p>
                  </div>

                  <div 
                    className={`risk-card ${formData.riskTolerance === 'medium' ? 'selected' : ''}`}
                    onClick={() => handleSetRiskTolerance('medium')}
                  >
                    <div className="risk-card-top">
                      <span className="risk-title">Medium (Balanced)</span>
                      {formData.riskTolerance === 'medium' && <Check size={16} className="risk-check" />}
                    </div>
                    <p className="risk-desc">Balanced growth. Index mutual funds, blue chips, balanced advantage assets.</p>
                  </div>

                  <div 
                    className={`risk-card ${formData.riskTolerance === 'high' ? 'selected' : ''}`}
                    onClick={() => handleSetRiskTolerance('high')}
                  >
                    <div className="risk-card-top">
                      <span className="risk-title">High (Aggressive)</span>
                      {formData.riskTolerance === 'high' && <Check size={16} className="risk-check" />}
                    </div>
                    <p className="risk-desc">High capital appreciation. Mid & small-cap equity, diversified growth portfolio.</p>
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label className="field-label">Investment Horizon (Years) <span className="required-star">*</span></label>
                <div className="input-icon-wrapper">
                  <TrendingUp size={16} className="field-prefix-icon" />
                  <input
                    type="number"
                    name="investmentTimeline"
                    placeholder="e.g. 5"
                    value={formData.investmentTimeline}
                    onChange={handleChange}
                    className="styled-input with-prefix"
                    min="1"
                    max="50"
                    required
                  />
                  <span className="input-suffix-tag">Years</span>
                </div>
              </div>

              <div className="input-group full-width">
                <label className="field-label">Top Financial Goal <span className="optional-tag">(optional)</span></label>
                <div className="input-icon-wrapper">
                  <Target size={16} className="field-prefix-icon" />
                  <input
                    type="text"
                    name="financialGoals"
                    placeholder="e.g. Buy a 2BHK flat in 7 years, build ₹50 Lakh retirement corpus"
                    value={formData.financialGoals}
                    onChange={handleChange}
                    className="styled-input with-prefix"
                  />
                </div>
                {/* QUICK SUGGESTION PILLS */}
                <div className="goal-suggestion-row">
                  <span className="suggestion-label">Popular goals:</span>
                  <button 
                    type="button" 
                    className="goal-suggestion-pill"
                    onClick={() => handleApplyGoalSuggestion("Buy a 2BHK home in 5-7 years")}
                  >
                    🏡 Buy a Home
                  </button>
                  <button 
                    type="button" 
                    className="goal-suggestion-pill"
                    onClick={() => handleApplyGoalSuggestion("Build 6-month emergency reserve fund")}
                  >
                    🛡 Emergency Fund
                  </button>
                  <button 
                    type="button" 
                    className="goal-suggestion-pill"
                    onClick={() => handleApplyGoalSuggestion("Long-term retirement corpus via SIP")}
                  >
                    📈 Retirement via SIP
                  </button>
                  <button 
                    type="button" 
                    className="goal-suggestion-pill"
                    onClick={() => handleApplyGoalSuggestion("Child higher education corpus")}
                  >
                    🎓 Child Education
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON ROW */}
          <div className="form-submit-footer">
            <button type="submit" className="form-submit-btn-modern">
              <span>Save & continue</span>
              <ArrowRight size={18} />
            </button>
            <p className="privacy-reassurance-note">
              🔒 FinTwin stores your financial figures securely. Your parameters are used strictly for local calculations, loan sanity checks, and verified advisory.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FinancialProfile;
