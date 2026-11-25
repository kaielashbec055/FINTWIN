/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { 
  LayoutDashboard, 
  MessageSquareCode, 
  Landmark, 
  Building2, 
  Plus, 
  Calendar, 
  Compass, 
  User, 
  Briefcase, 
  BriefcaseBusiness, 
  MapPin, 
  CalendarDays, 
  Target, 
  LogOut, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  Settings 
} from "lucide-react";
import "./Homepage.css";
import axios from "axios";
import AddTransactionModal from "./AddTransactionModal";
import Assets from "./assets"; 
import AIAdvisor from "./AIAdvisor";
import LoansPage from "./LoansPage";
import InvestmentsPage from "./InvestmentsPage";
import SchemesPage from "./SchemesPage";
import GoalsPage from "./GoalsPage";
import DocumentsPage from "./DocumentsPage";
import SettingsPage from "./SettingsPage";
import { useLanguage } from "../context/LanguageContext";

function Homepage() {
  const navigate = useNavigate();
  const { t, language, setLanguage, supportedLanguages } = useLanguage();
  const [showToast, setShowToast] = useState(true);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [activeSection, setActiveSection] = useState("dashboard"); 
  const [transactions, setTransactions] = useState([]);
  const [userData, setUserData] = useState({
    name: "",
    email: ""
  });
  
  const [metrics, setMetrics] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    savingsRate: 0
  });

  const [profileSnapshot, setProfileSnapshot] = useState({
    age: "",
    phone: "",
    occupation: "",
    employmentType: "",
    city: "",
    dependents: "",
    monthlyIncome: "₹0",       
    monthlyExpenses: "₹0",      
    riskAppetite: "",
    investmentHorizon: "",
    financialGoal: ""
  });

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    name: "",
    age: "",
    phone: "",
    occupation: "",
    employmentType: "Salaried",
    city: "",
    dependents: "",
    monthlyIncome: "",
    monthlyExpenses: "",
    riskAppetite: "Moderate",
    investmentHorizon: "",
    financialGoal: ""
  });

  const handleOpenEditProfile = () => {
    const rawIncome = String(profileSnapshot.monthlyIncome || "").replace(/[^\d.]/g, "");
    const rawExpenses = String(profileSnapshot.monthlyExpenses || "").replace(/[^\d.]/g, "");
    const rawHorizon = String(profileSnapshot.investmentHorizon || "").replace(/[^\d.]/g, "");

    setEditProfileForm({
      name: userData.name || localStorage.getItem("userName") || "",
      age: profileSnapshot.age === "Not Specified" ? "" : (profileSnapshot.age || ""),
      phone: profileSnapshot.phone === "Not Provided" ? "" : (profileSnapshot.phone || ""),
      occupation: profileSnapshot.occupation === "Not Specified" ? "" : (profileSnapshot.occupation || ""),
      employmentType: profileSnapshot.employmentType === "Not Specified" ? "Salaried" : (profileSnapshot.employmentType || "Salaried"),
      city: profileSnapshot.city === "Not Specified" ? "" : (profileSnapshot.city || ""),
      dependents: profileSnapshot.dependents === "0" ? "" : (profileSnapshot.dependents || ""),
      monthlyIncome: rawIncome === "0" ? "" : rawIncome,
      monthlyExpenses: rawExpenses === "0" ? "" : rawExpenses,
      riskAppetite: profileSnapshot.riskAppetite === "Not Evaluated" ? "Moderate" : (profileSnapshot.riskAppetite || "Moderate"),
      investmentHorizon: rawHorizon || "",
      financialGoal: profileSnapshot.financialGoal || ""
    });
    setIsEditProfileOpen(true);
  };

  const handleSaveEditProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const userEmail = (localStorage.getItem("userEmail") || "user").toLowerCase().trim();

    const cleanIncome = parseFloat(String(editProfileForm.monthlyIncome).replace(/[^\d.]/g, "")) || 0;
    const cleanExpenses = parseFloat(String(editProfileForm.monthlyExpenses).replace(/[^\d.]/g, "")) || 0;
    const cleanHorizon = editProfileForm.investmentHorizon ? `${editProfileForm.investmentHorizon} Years` : "Not Set";

    const payload = {
      name: editProfileForm.name,
      age: editProfileForm.age,
      phone: editProfileForm.phone,
      occupation: editProfileForm.occupation,
      employmentType: editProfileForm.employmentType,
      city: editProfileForm.city,
      dependents: editProfileForm.dependents,
      monthlyIncome: cleanIncome,
      monthlyExpenses: cleanExpenses,
      riskTolerance: editProfileForm.riskAppetite,
      investmentTimeline: editProfileForm.investmentHorizon,
      financialGoals: editProfileForm.financialGoal,
      profileCompleted: true
    };

    const reqConfig = {
      headers: {
        "x-auth-token": token,
        "Authorization": `Bearer ${token}`
      }
    };

    try {
      try {
        await axios.put("http://localhost:5000/api/profile", payload, { ...reqConfig, timeout: 2500 });
      } catch (localErr) {
        try {
          await axios.post("http://localhost:5000/api/profile", payload, { ...reqConfig, timeout: 2500 });
        } catch (postErr) {
          await axios.put("https://wealth-ai-backend.onrender.com/api/profile", payload, reqConfig);
        }
      }

      localStorage.setItem("userName", editProfileForm.name);
      localStorage.setItem(`${userEmail}_name`, editProfileForm.name);
      localStorage.setItem(`${userEmail}_age`, editProfileForm.age);
      localStorage.setItem(`${userEmail}_phone`, editProfileForm.phone);
      localStorage.setItem(`${userEmail}_occupation`, editProfileForm.occupation);
      localStorage.setItem(`${userEmail}_employmentType`, editProfileForm.employmentType);
      localStorage.setItem(`${userEmail}_city`, editProfileForm.city);
      localStorage.setItem(`${userEmail}_dependents`, editProfileForm.dependents);
      localStorage.setItem(`${userEmail}_totalIncome`, cleanIncome);
      localStorage.setItem(`${userEmail}_totalExpenses`, cleanExpenses);
      localStorage.setItem(`${userEmail}_riskTolerance`, editProfileForm.riskAppetite);
      localStorage.setItem(`${userEmail}_investmentHorizon`, editProfileForm.investmentHorizon);
      localStorage.setItem(`${userEmail}_financialGoal`, editProfileForm.financialGoal);

      setUserData(prev => ({ ...prev, name: editProfileForm.name }));
      setProfileSnapshot({
        age: editProfileForm.age || "Not Specified",
        phone: editProfileForm.phone || "Not Provided",
        occupation: editProfileForm.occupation || "Not Specified",
        employmentType: editProfileForm.employmentType || "Not Specified",
        city: editProfileForm.city || "Not Specified",
        dependents: editProfileForm.dependents || "0",
        monthlyIncome: cleanIncome > 0 ? `₹${cleanIncome.toLocaleString("en-IN")}` : "₹0",
        monthlyExpenses: cleanExpenses > 0 ? `₹${cleanExpenses.toLocaleString("en-IN")}` : "₹0",
        riskAppetite: editProfileForm.riskAppetite,
        investmentHorizon: cleanHorizon,
        financialGoal: editProfileForm.financialGoal || ""
      });

      setIsEditProfileOpen(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Error updating profile. Please try again.");
    }
  };



  // FIX 1: Fetch profile values directly from MongoDB via GET API
  useEffect(() => {
    const loadUserAndProfile = async () => {
      const token = localStorage.getItem("token");
      const storedName = localStorage.getItem("userName") || "";
      const storedEmail = localStorage.getItem("userEmail") || "";

      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }

      setUserData({
        name: storedName,
        email: storedEmail
      });

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
        
        if (res.data && Object.keys(res.data).length > 0) {
          // Direct sync database fields matching your MongoDB Compass keys
          setProfileSnapshot({
            age: res.data.age || "Not Specified",
            phone: res.data.phone || "Not Provided",
            occupation: res.data.occupation || "Not Specified",
            employmentType: res.data.employmentType || "Not Specified",
            city: res.data.city || "Not Specified", 
            dependents: res.data.dependents || "0",
            monthlyIncome: res.data.monthlyIncome ? `₹${Number(res.data.monthlyIncome).toLocaleString("en-IN")}` : "₹0",
            monthlyExpenses: res.data.monthlyExpenses ? `₹${Number(res.data.monthlyExpenses).toLocaleString("en-IN")}` : "₹0",
            riskAppetite: res.data.riskTolerance || "Not Evaluated",
            investmentHorizon: res.data.investmentTimeline ? `${String(res.data.investmentTimeline).replace(/[\s]*Years/gi, "")} Years` : "Not Set",
            financialGoal: res.data.financialGoals || ""
          });

          // Sync calculation metrics state block values
          setMetrics(prev => ({
            ...prev,
            income: parseFloat(res.data.monthlyIncome) || 0,
            expenses: parseFloat(res.data.monthlyExpenses) || 0,
            balance: (parseFloat(res.data.monthlyIncome) || 0) - (parseFloat(res.data.monthlyExpenses) || 0)
          }));
        } else {
          navigate("/profile", { replace: true });
        }
      } catch (err) {
        console.log("Error querying database fields from server endpoint controller");
      }
    };

    loadUserAndProfile();
    const timer = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  useEffect(() => {
    if (!userData.email) return;
    
    const savedTransactions = JSON.parse(
      localStorage.getItem(`${userData.email}_transactions`)
    );

    if (savedTransactions) {
      setTransactions(savedTransactions);
    } else {
      setTransactions([]); 
    }
  }, [userData.email]);

  useEffect(() => {
    if (!userData.email) return;

    localStorage.setItem(
      `${userData.email}_transactions`,
      JSON.stringify(transactions)
    );
  }, [transactions, userData.email]);

  // Show 0 when no transactions have been added yet
  useEffect(() => {
    if (!userData.email) return;

    let computedIncome = 0;
    let computedExpenses = 0;

    if (transactions && transactions.length > 0) {
      transactions.forEach((tx) => {
        const amount = parseFloat(tx.amount) || 0;
        if (tx.type?.toLowerCase() === "income" || tx.category?.toLowerCase() === "income") {
          computedIncome += amount;
        } else {
          computedExpenses += amount;
        }
      });
    }

    // No transactions = show zeroes. Do NOT fall back to profile income/expenses.
    const computedBalance = computedIncome - computedExpenses;
    let computedSavingsRate = 0;

    if (computedIncome > 0) {
      computedSavingsRate = ((computedIncome - computedExpenses) / computedIncome) * 100;
      if (computedSavingsRate < 0) computedSavingsRate = 0;
    }

    setMetrics({
      balance: computedBalance,
      income: computedIncome,
      expenses: computedExpenses,
      savingsRate: parseFloat(computedSavingsRate.toFixed(1))
    });
  }, [transactions, userData.email]);

  const handleSaveTransaction = (newTx) => {
    if (Array.isArray(newTx)) {
      setTransactions(prev => [...prev, ...newTx]);
    } else {
      setTransactions(prev => [...prev, newTx]);
    }
    setIsTransactionOpen(false);
  };

  const handleManualSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const rawIncome = String(profileSnapshot.monthlyIncome || "0");
      const rawExpenses = String(profileSnapshot.monthlyExpenses || "0");
      const rawHorizon = String(profileSnapshot.investmentHorizon || "0");

      const cleanIncome = rawIncome.replace(/[₹,]/g, "");
      const cleanExpenses = rawExpenses.replace(/[₹,]/g, "");
      const cleanHorizon = rawHorizon.replace(/[^0-9]/g, "");

      const payload = {
        name: userData.name,
        age: profileSnapshot.age,
        phone: profileSnapshot.phone,
        occupation: profileSnapshot.occupation,
        employmentType: profileSnapshot.employmentType,
        city: profileSnapshot.city,
        dependents: profileSnapshot.dependents,
        monthlyIncome: cleanIncome,
        monthlyExpenses: cleanExpenses,
        riskTolerance: profileSnapshot.riskAppetite,
        investmentTimeline: cleanHorizon,
        financialGoals: profileSnapshot.financialGoal,
        profileCompleted: true
      };

      const reqConfig = { 
        headers: { 
          "x-auth-token": token,
          "Authorization": `Bearer ${token}`
        } 
      };

      try {
        await axios.post("http://localhost:5000/api/profile", payload, { ...reqConfig, timeout: 2500 });
      } catch (localErr) {
        await axios.post("https://wealth-ai-backend.onrender.com/api/profile", payload, reqConfig);
      }

      alert("Saved successfully!");
    } catch (error) {
      alert(error.response?.data?.msg || "Failed to backup parameters online");
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/", { replace: true });
  };



   const filteredTransactions = (() => {
    if (!transactions || transactions.length === 0) return [];

    const now = new Date();
    const validTimestamps = transactions
      .map(tx => new Date(tx.date).getTime())
      .filter(t => !isNaN(t));

    const maxTxTime = validTimestamps.length > 0 ? Math.max(...validTimestamps) : now.getTime();
    const referenceDate = new Date(Math.max(maxTxTime, now.getTime()));

    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      if (isNaN(txDate.getTime())) return true;

      switch (selectedPeriod) {
        case "last_30_days": {
          const limit = new Date(referenceDate);
          limit.setDate(limit.getDate() - 30);
          return txDate >= limit;
        }
        case "last_3_months": {
          const limit = new Date(referenceDate);
          limit.setMonth(limit.getMonth() - 3);
          return txDate >= limit;
        }
        case "last_6_months": {
          const limit = new Date(referenceDate);
          limit.setMonth(limit.getMonth() - 6);
          return txDate >= limit;
        }
        case "last_year": {
          const limit = new Date(referenceDate);
          limit.setFullYear(limit.getFullYear() - 1);
          return txDate >= limit;
        }
        default:
          return true;
      }
    });
  })();

  // Only compute from actual transactions, not profile fallback
  let totalIncome = 0;
  let totalExpenses = 0;

  if (filteredTransactions.length > 0) {
    filteredTransactions.forEach(tx => {
      const amount = parseFloat(String(tx.amount).replace(/[₹,]/g, "")) || 0;
      const typeNormalized = (tx.type || "").toLowerCase().trim();
      const catNormalized = (tx.category || "").toLowerCase().trim();
      
      if (typeNormalized === "income" || catNormalized === "income") {
        totalIncome += amount;
      } else {
        totalExpenses += amount;
      }
    });
  }

  const calculatedBalance = totalIncome - totalExpenses;
  let calculatedSavingsRate = 0;

  if (totalIncome > 0 && calculatedBalance > 0) {
    calculatedSavingsRate = (calculatedBalance / totalIncome) * 100;
  }

  const liveMetrics = {
    balance: calculatedBalance,
    income: totalIncome,
    expenses: totalExpenses,
    savingsRate: calculatedSavingsRate.toFixed(1)
  };

  const getTimelineData = () => {
    if (filteredTransactions.length === 0) {
      return [{ name: "Current Month", Income: totalIncome, Expenses: totalExpenses }];
    }

    const sorted = [...filteredTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let runningIncome = 0;
    let runningExpenses = 0;

    return sorted.map((tx) => {
      const amt = parseFloat(String(tx.amount).replace(/[₹,]/g, "")) || 0;
      const typeNormalized = (tx.type || "").toLowerCase().trim();
      const catNormalized = (tx.category || "").toLowerCase().trim();

      if (typeNormalized === "income" || catNormalized === "income") {
        runningIncome += amt;
      } else {
        runningExpenses += amt;
      }

      return {
        name: new Date(tx.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        Income: runningIncome,
        Expenses: runningExpenses
      };
    });
  };

  const getDoughnutData = () => {
    if (filteredTransactions.length === 0) {
      return [{ name: "Profile Expenses Base", value: totalExpenses, fillColor: "#ef4444" }];
    }
    const categories = {};
    filteredTransactions.forEach(tx => {
      const typeNormalized = (tx.type || "").toLowerCase().trim();
      const catNormalized = (tx.category || "").toLowerCase().trim();
      
      if (typeNormalized !== "income" && catNormalized !== "income") {
        const cat = tx.category || "Other";
        categories[cat] = (categories[cat] || 0) + (parseFloat(String(tx.amount).replace(/[₹,]/g, "")) || 0);
      }
    });

    const chartArray = Object.keys(categories).map(key => ({
      name: key,
      value: categories[key]
    }));

    return chartArray.length > 0 ? chartArray : [{ name: "No Expenses", value: 1, fillColor: "#e2e8f0" }];
  };

  const PIE_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="dashboard-root-layout">
      <div className="ambient-blur-one"></div>
      <div className="ambient-blur-two"></div>

      {showToast && <div className="success-toast">Welcome back</div>}

      <aside className="fixed-sidebar-container">
        <div className="sidebar-brand-area">
          <div className="logo-main">Fin<span>Twin</span></div>
        </div>
        <nav className="sidebar-navigation-links">
          <div className={`nav-link-item ${activeSection === "dashboard" ? "active" : ""}`} onClick={() => setActiveSection("dashboard")}>
            <LayoutDashboard size={18} /> <span>{t('nav_dashboard', 'Dashboard')}</span>
          </div>
          <div className={`nav-link-item ${activeSection === "advisor" ? "active" : ""}`} onClick={() => setActiveSection("advisor")}>
            <MessageSquareCode size={18} /> <span>{t('nav_advisor', 'AI Advisor')}</span>
          </div>
          <div className={`nav-link-item ${activeSection === "loans" ? "active" : ""}`} onClick={() => setActiveSection("loans")}>
            <Landmark size={18} /> <span>{t('nav_loans', 'Loans')}</span>
          </div>
          <div className={`nav-link-item ${activeSection === "investments" ? "active" : ""}`} onClick={() => setActiveSection("investments")}>
            <TrendingUp size={18} /> <span>{t('nav_investments', 'Investments')}</span>
          </div>
          <div className={`nav-link-item ${activeSection === "schemes" ? "active" : ""}`} onClick={() => setActiveSection("schemes")}>
            <ShieldCheck size={18} /> <span>{t('nav_schemes', 'Schemes')}</span>
          </div>
          <div className={`nav-link-item ${activeSection === "goals" ? "active" : ""}`} onClick={() => setActiveSection("goals")}>
            <Target size={18} /> <span>{t('nav_goals', 'Goals')}</span>
          </div>
          <div className={`nav-link-item ${activeSection === "assets" ? "active" : ""}`} onClick={() => setActiveSection("assets")}>
            <Building2 size={18} /> <span>{t('nav_assets', 'Assets')}</span>
          </div>
          <div className={`nav-link-item ${activeSection === "documents" ? "active" : ""}`} onClick={() => setActiveSection("documents")}>
            <FileText size={18} /> <span>{t('nav_documents', 'Documents')}</span>
          </div>
          <div className={`nav-link-item ${activeSection === "settings" ? "active" : ""}`} onClick={() => setActiveSection("settings")}>
            <Settings size={18} /> <span>{t('nav_settings', 'Settings')}</span>
          </div>
        </nav>
        
        <div 
          className={`sidebar-user-footer ${activeSection === "profile" ? "active" : ""}`} 
          onClick={() => setActiveSection("profile")}
          style={{ cursor: "pointer" }}
        >
          <div className="user-avatar-circle">
            {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="user-detail-meta">
            <span className="name">{userData.name || "User"}</span>
            <span className="email">{userData.email || "Validating..."}</span>
          </div>
        </div>
      </aside>

      <main className="dashboard-main-content">
        
        {activeSection === "dashboard" && (
          <>
            <header className="workspace-action-header">
              <div className="header-greeting-box">
                <p>{t('nav_dashboard', 'Dashboard')}</p>
                <h2>{t('dash_welcome_back', 'Welcome back')}, {userData.name || "User"}</h2>
                <p>Your active capital parameters are loaded</p>
              </div>

              <div className="header-controls-group">
                <div className="select-dropdown-style">
                  <Calendar size={14} />
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    <option value="all">All Data</option>
                    <option value="last_30_days">Last 30 days</option>
                    <option value="last_3_months">Last 3 months</option>
                    <option value="last_6_months">Last 6 months</option>
                    <option value="last_year">Last year</option>
                  </select>
                </div>

                <button
                  className="primary-action-btn"
                  onClick={() => setIsTransactionOpen(true)}
                >
                  <Plus size={16}/>
                  <span>{t('dash_add_transaction', 'Add Transaction')}</span>
                </button>
              </div>
            </header>

            <section className="metrics-summary-grid">
              <div className="metric-card-item">
                <span className="metric-label">{t('dash_total_balance', 'AVAILABLE BALANCE')}</span>
                <h3 className="metric-value">₹{Number(liveMetrics.balance || 0).toLocaleString("en-IN")}</h3>
              </div>
              <div className="metric-card-item">
                <span className="metric-label">{t('dash_monthly_income', 'TOTAL INCOME')}</span>
                <h3 className="metric-value success">₹{Number(liveMetrics.income || 0).toLocaleString("en-IN")}</h3>
              </div>
              <div className="metric-card-item">
                <span className="metric-label">{t('dash_monthly_expenses', 'TOTAL EXPENSES')}</span>
                <h3 className="metric-value danger">₹{Number(liveMetrics.expenses || 0).toLocaleString("en-IN")}</h3>
              </div>
              <div className="metric-card-item">
                <span className="metric-label">{t('dash_savings_rate', 'SAVINGS RATE')}</span>
                <h3 className="metric-value interest">{liveMetrics.savingsRate}%</h3>
              </div>
            </section>
            <section className="charts-visual-container">
              <div className="chart-card-wrapper area-timeline-card">
                <h4>Income vs Expense Analysis</h4>
                <div className="recharts-responsive-container-box">
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={getTimelineData()}>
                      <defs>
                        <linearGradient id="incomeColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="expenseColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="Income" stroke="#10b981" fillOpacity={1} fill="url(#incomeColor)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#expenseColor)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card-wrapper pie-allocation-card">
                <h4>Expense by Category</h4>
                <div className="recharts-responsive-container-box pie-layout-box">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={getDoughnutData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {getDoughnutData().map((entry, index) => (
                          /* FIXED: Updated entry.color to entry.fillColor to match data engine maps */
                          <Cell key={`cell-${index}`} fill={entry.fillColor || PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pie-custom-legends">
                    {getDoughnutData().slice(0, 3).map((item, idx) => (
                      <div className="legend-row-item" key={idx}>
                        {/* FIXED: Updated item.color to item.fillColor for baseline style loading */}
                        <span className="legend-dot" style={{ backgroundColor: item.fillColor || PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                        <span className="legend-name">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          <section className="transactions-ledger-panel" id="transactions-report-section">
              <div className="panel-header-sub">
                <h4>Transaction Records</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="total-tx-count">{filteredTransactions.length} Active Lines</span>
                  {filteredTransactions.length > 0 && (
                    <button
                      className="print-report-btn"
                      onClick={() => window.print()}
                      title="Download / Print Report"
                    >
                      ⬇ Download Report
                    </button>
                  )}
                </div>
              </div>
              <div className="table-responsive-wrapper">
                {filteredTransactions.length === 0 ? (
                  <div className="empty-ledger-state">
                    <Compass size={28} />
                    <p>No Transactions yet</p>
                  </div>
                ) : (
                  <table className="ledger-data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Reference Element</th>
                        <th>Category</th>
                        <th>Vector</th>
                        <th style={{ textAlign: "right" }}>Quantum Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((tx, idx) => {
                        // Normalize the string type to avoid case sensitivity bugs
                        const txTypeLower = (tx.type || "").toLowerCase().trim();
                        const isIncome = txTypeLower === "income";

                        return (
                          <tr key={idx}>
                            <td>{new Date(tx.date).toLocaleDateString("en-IN")}</td>
                            <td className="bold-desc">{tx.description}</td>
                            <td><span className="table-badge-cat">{tx.category}</span></td>
                            <td>
                              {/* FIXED: Using clean lowercase checker variable */}
                              <span className={`vector-badge ${isIncome ? "inflow" : "outflow"}`}>
                                {isIncome ? "Inflow Stream" : "Settlement"}
                              </span>
                            </td>
                            {/* FIXED: Using clean lowercase checker variable */}
                            <td className={`quantum-cell ${isIncome ? "success" : "danger"}`} style={{ textAlign: "right" }}>
                              {isIncome ? "+" : "-"} ₹{parseFloat(tx.amount).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </>
        )}

        {/* 2. AI ADVISOR WORKSPACE (ChatGPT-Style Conversational Interface) */}
        {activeSection === "advisor" && (
          <AIAdvisor profile={profileSnapshot} />
        )}
        
        {/* 3. LOANS MANAGEMENT & BANK EXPLORER */}
        {activeSection === "loans" && (
          <LoansPage profile={profileSnapshot} />
        )}

        {/* 4. INVESTMENTS PORTFOLIO */}
        {activeSection === "investments" && (
          <InvestmentsPage profile={profileSnapshot} />
        )}

        {/* 5. GOVERNMENT OF INDIA SCHEMES (myScheme Platform) */}
        {activeSection === "schemes" && (
          <SchemesPage profile={profileSnapshot} />
        )}

        {/* 6. FINANCIAL GOALS */}
        {activeSection === "goals" && (
          <GoalsPage profile={profileSnapshot} />
        )}

        {/* 7. ASSETS TRACKING VIEW */}
        {activeSection === "assets" && (
          <div className="real-estate-section-wrapper" style={{ width: '100%' }}>
            <Assets profile={profileSnapshot} />
          </div>
        )}

        {/* 8. FINANCIAL DOCUMENTS VAULT */}
        {activeSection === "documents" && (
          <DocumentsPage />
        )}

        {/* 9. SETTINGS & PREFERENCES */}
        {activeSection === "settings" && (
          <SettingsPage />
        )}


        {/* PROFILE CARD TAB VIEW - DYNAMIC FROM PROFILE SETUP LOCALSTORAGE SCREEN */}
        {activeSection === "profile" && (
          <div className="yields-section-wrapper">
            <div className="section-title-blurb" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3>My Profile</h3>
                <p>Review and track your holistic structural account dimensions below.</p>
              </div>
              <button
                className="edit-profile-btn"
                onClick={handleOpenEditProfile}
              >
                ✏ Edit Profile
              </button>
            </div>
            
            <div className="yields-metric-cards-subgrid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              <div className="yield-card-metric">
                <span className="sub-lbl"><User size={14} style={{ display: "inline", marginRight: "6px" }} /> Age Context</span>
                <h3>{profileSnapshot.age}</h3>
              </div>
              <div className="yield-card-metric">
                <span className="sub-lbl"><Briefcase size={14} style={{ display: "inline", marginRight: "6px" }} /> Occupation / Role</span>
                <h3>{profileSnapshot.occupation}</h3>
              </div>
              <div className="yield-card-metric">
                <span className="sub-lbl"><BriefcaseBusiness size={14} style={{ display: "inline", marginRight: "6px" }} /> Employment Nature</span>
                <h3>{profileSnapshot.employmentType}</h3>
              </div>
              <div className="yield-card-metric">
                <span className="sub-lbl"><MapPin size={14} style={{ display: "inline", marginRight: "6px" }} /> City Geolocation</span>
                <h3>{profileSnapshot.city}</h3>
              </div>
              <div className="yield-card-metric">
                <span className="sub-lbl">Monthly Income</span>
                <h3>{profileSnapshot.displayIncome || profileSnapshot.monthlyIncome}</h3>
              </div>
              <div className="yield-card-metric">
                <span className="sub-lbl">Monthly Expenses</span>
                <h3>{profileSnapshot.displayExpenses || profileSnapshot.monthlyExpenses}</h3>
              </div>
              <div className="yield-card-metric">
                <span className="sub-lbl">Registered Dependents</span>
                <h3>{profileSnapshot.dependents} Units</h3>
              </div>
              <div className="yield-card-metric">
                <span className="sub-lbl">Risk Strategy</span>
                <h3 style={{ textTransform: "capitalize" }}>{profileSnapshot.riskAppetite}</h3>
              </div>
              <div className="yield-card-metric">
                <span className="sub-lbl"><CalendarDays size={14} style={{ display: "inline", marginRight: "6px" }} /> Horizon Metric</span>
                <h3>{profileSnapshot.investmentHorizon}</h3>
              </div>
            </div>

            {/* DYNAMIC SHOW FOR FINANCIAL GOALS CARD */}
            {profileSnapshot.financialGoal && profileSnapshot.financialGoal !== "Not Set" && (
              <div className="yield-card-metric" style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ backgroundColor: "#eff6ff", padding: "12px", borderRadius: "8px", color: "#2563eb" }}>
                  <Target size={24} />
                </div>
                <div>
                  <span className="sub-lbl" style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: "600", color: "#64748b" }}>Primary Stated Financial Goal</span>
                  <h3 style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: "600", color: "#0f172a" }}>{profileSnapshot.financialGoal}</h3>
                </div>
              </div>
            )}

            <div className="logout-container">
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={18}/>
                Logout
              </button>
            </div>
          </div>
        )}

      </main>

      {/* FLOATING ADD TRANSACTION MODAL */}
      {isEditProfileOpen && (
        <div className="tx-modal-overlay" onClick={() => setIsEditProfileOpen(false)}>
          <div className="tx-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "680px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="tx-modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", padding: "16px 20px" }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0", color: "#800020", fontSize: "19px" }}>Edit Financial Profile</h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                  Update your personal parameters to get tailored financial advice and calculations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditProfile} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", marginBottom: "5px", color: "#334155" }}>Full Name</label>
                  <input
                    type="text"
                    value={editProfileForm.name}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px" }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", marginBottom: "5px", color: "#334155" }}>Age</label>
                  <input
                    type="number"
                    value={editProfileForm.age}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, age: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px" }}
                    placeholder="e.g. 28"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", marginBottom: "5px", color: "#334155" }}>Phone Number</label>
                  <input
                    type="text"
                    value={editProfileForm.phone}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px" }}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", marginBottom: "5px", color: "#334155" }}>City / Location</label>
                  <input
                    type="text"
                    value={editProfileForm.city}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, city: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px" }}
                    placeholder="e.g. Mumbai, Maharashtra"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", marginBottom: "5px", color: "#334155" }}>Occupation / Profession</label>
                  <input
                    type="text"
                    value={editProfileForm.occupation}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, occupation: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px" }}
                    placeholder="e.g. Software Engineer, Doctor"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", marginBottom: "5px", color: "#334155" }}>Employment Type</label>
                  <select
                    value={editProfileForm.employmentType}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, employmentType: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px", background: "#fff" }}
                  >
                    <option value="Salaried">Salaried</option>
                    <option value="Self-Employed">Self-Employed / Freelancer</option>
                    <option value="Business Owner">Business Owner</option>
                    <option value="Student">Student</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", marginBottom: "5px", color: "#334155" }}>Monthly In-Hand Income (₹)</label>
                  <input
                    type="number"
                    value={editProfileForm.monthlyIncome}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, monthlyIncome: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px" }}
                    placeholder="e.g. 75000"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", marginBottom: "5px", color: "#334155" }}>Monthly Expenses (₹)</label>
                  <input
                    type="number"
                    value={editProfileForm.monthlyExpenses}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, monthlyExpenses: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px" }}
                    placeholder="e.g. 35000"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", marginBottom: "5px", color: "#334155" }}>Registered Dependents</label>
                  <input
                    type="number"
                    value={editProfileForm.dependents}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, dependents: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px" }}
                    placeholder="e.g. 2"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", marginBottom: "5px", color: "#334155" }}>Risk Appetite</label>
                  <select
                    value={editProfileForm.riskAppetite}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, riskAppetite: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px", background: "#fff" }}
                  >
                    <option value="Conservative">Conservative (Low Risk)</option>
                    <option value="Moderate">Moderate (Balanced)</option>
                    <option value="Aggressive">Aggressive (High Growth)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", marginBottom: "5px", color: "#334155" }}>Investment Horizon (Years)</label>
                  <input
                    type="number"
                    value={editProfileForm.investmentHorizon}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, investmentHorizon: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px" }}
                    placeholder="e.g. 5"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", marginBottom: "5px", color: "#334155" }}>Primary Financial Goal</label>
                  <input
                    type="text"
                    value={editProfileForm.financialGoal}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, financialGoal: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px" }}
                    placeholder="e.g. Home purchase, Retirement"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid #f1f5f9", paddingTop: "14px" }}>
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  style={{
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 600,
                    color: "#475569"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: "#800020",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 700
                  }}
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTransactionOpen && (
        <AddTransactionModal 
          isOpen={isTransactionOpen}
          onClose={() => setIsTransactionOpen(false)} 
          onSave={handleSaveTransaction} 
        />
      )}
    </div>
  );
}

export default Homepage;
