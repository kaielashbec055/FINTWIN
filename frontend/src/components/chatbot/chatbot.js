import React, { useState, useEffect, useRef } from "react";
import "./chatbot.css";
import { BANKS_DATA } from "../../data/banksData";

const Chatbot = ({ userName, profile }) => {
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState("start");
  const [loanType, setLoanType] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const initialized = useRef(false);

  // 1. DYNAMIC WELCOME GREETING WITH ACTIVE USERNAME
  useEffect(() => {
    if (!initialized.current && userName) {
      setMessages([
        {
          text: `Hi ${userName || "User"}, welcome to FinTwin! I am your AI financial assistant. How can I help you today with loans, investments, bank comparisons, or financial planning?`,
          isUser: false,
          link: "",
          bankName: ""
        }
      ]);
      initialized.current = true;
    }
  }, [userName]);

  // SMOOTH SCROLL CONTEXT TO NEWEST MESSAGE BLOCK
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // LOCAL BANK COMPARISON CONVERSATION REFERENCE MATRIX (Across all 5 categories)
  const bankData = {
    // Public Sector
    "SBI": { rate: "8.50% - 9.65%", tenure: "30 yrs", link: "https://sbi.co.in" },
    "Bank of Baroda": { rate: "8.40% onwards", tenure: "30 yrs", link: "https://bankofbaroda.in" },
    "PNB": { rate: "8.50% onwards", tenure: "30 yrs", link: "https://pnbindia.in" },
    "Canara Bank": { rate: "8.40% onwards", tenure: "30 yrs", link: "https://canarabank.com" },
    "Union Bank": { rate: "8.35% onwards", tenure: "30 yrs", link: "https://unionbankofindia.co.in" },
    // Private Sector
    "HDFC Bank": { rate: "8.70% - 9.65%", tenure: "30 yrs", link: "https://hdfcbank.com" },
    "ICICI Bank": { rate: "8.75% onwards", tenure: "30 yrs", link: "https://icicibank.com" },
    "Axis Bank": { rate: "8.75% onwards", tenure: "30 yrs", link: "https://axisbank.com" },
    "Kotak Bank": { rate: "8.70% onwards", tenure: "30 yrs", link: "https://kotak.com" },
    "IDBI Bank": { rate: "8.50% onwards", tenure: "30 yrs", link: "https://idbibank.in" },
    // Small Finance Banks
    "AU SFB": { rate: "9.40% onwards", tenure: "25 yrs", link: "https://aubank.in" },
    "Equitas SFB": { rate: "9.75% onwards", tenure: "20 yrs", link: "https://equitasbank.com" },
    "Ujjivan SFB": { rate: "9.60% onwards", tenure: "20 yrs", link: "https://ujjivansfb.in" },
    "Jana SFB": { rate: "9.75% onwards", tenure: "20 yrs", link: "https://janabank.com" },
    // Regional Rural Banks
    "Aryavart Bank": { rate: "8.65% onwards", tenure: "20 yrs", link: "https://aryavart-rrb.com" },
    "Baroda UP Bank": { rate: "8.60% onwards", tenure: "20 yrs", link: "https://barodaupbank.in" },
    "Kerala Gramin Bank": { rate: "8.50% onwards", tenure: "25 yrs", link: "https://keralagbank.com" },
    "Karnataka Gramin Bank": { rate: "8.60% onwards", tenure: "20 yrs", link: "https://karnatakagraminbank.com" },
    "AP Grameena Bank": { rate: "8.55% onwards", tenure: "20 yrs", link: "https://apgb.in" },
    // Cooperative Banks
    "Saraswat Bank": { rate: "8.60% onwards", tenure: "25 yrs", link: "https://saraswatbank.com" },
    "Cosmos Bank": { rate: "8.75% onwards", tenure: "20 yrs", link: "https://cosmosbank.com" },
    "SVC Bank": { rate: "8.70% onwards", tenure: "25 yrs", link: "https://svcbank.com" }
  };

  // Helper function to append bot responses safely
  function addBotMessage(text, link = "", bankName = "") {
    let cleanedText = text ? text.replace(/₹₹/g, "₹") : "";
    const newMsg = { text: cleanedText, isUser: false, link: link, bankName: bankName };
    setMessages(prev => [...prev, newMsg]);
  }

  // 2. DISPATCH PAYLOAD TO BACKEND (Local with cloud fallback, bank-context-aware)
  async function sendMessageToAI(userInput) {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const selectedBank = localStorage.getItem("fintwin_selected_bank") || "";
      const bankCategory = localStorage.getItem("fintwin_selected_bank_category") || "";

      const payload = { 
        message: userInput,
        userProfile: profile,
        selectedBank,
        bankCategory
      };

      let data;
      try {
        const response = await fetch("http://localhost:5000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token || "",
            "Authorization": token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          data = await response.json();
        }
      } catch (err) {
        // Fallback to hosted API
      }

      if (!data?.reply) {
        const fallbackRes = await fetch("https://wealth-ai-backend.onrender.com/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token || "",
            "Authorization": token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify(payload),
        });
        data = await fallbackRes.json();
      }
      
      if (data && data.reply) {
        addBotMessage(data.reply);
      } else {
        // Intelligent fallback if network/router is offline
        generateLocalFinancialResponse(userInput);
      }
    } catch (error) {
      console.error("API Link Error:", error);
      generateLocalFinancialResponse(userInput);
    } finally {
      setIsLoading(false);
    }
  }

  // Local fallback response generator for financial queries
  function generateLocalFinancialResponse(userInput) {
    const lower = userInput.toLowerCase();
    const activeBank = localStorage.getItem("fintwin_selected_bank");

    if (lower.includes("home loan") && (lower.includes("what is") || lower.includes("explain"))) {
      addBotMessage(
        "🏠 What is a Home Loan?\n\n" +
        "A home loan is a secured credit facility provided by banks and housing finance companies to purchase, construct, or renovate residential property.\n\n" +
        "Key Pillars:\n" +
        "1. Interest Rates: Range from 8.35% to 9.75% across Indian banks.\n" +
        "2. Maximum Tenure: Up to 30 years.\n" +
        "3. Tax Benefits: Deduction up to ₹1.5 Lakh under Section 80C (principal) and up to ₹2 Lakhs under Section 24b (interest).\n" +
        "4. Down Payment: Banks finance 75% - 90% of property cost; 10% - 25% is margin money."
      );
      return;
    }

    if (lower.includes("personal loan") && (lower.includes("what is") || lower.includes("explain"))) {
      addBotMessage(
        "💳 What is a Personal Loan?\n\n" +
        "A personal loan is an unsecured installment loan that does not require collateral. You can use it for weddings, medical emergencies, travel, or debt consolidation.\n\n" +
        "Key Highlights:\n" +
        "1. Interest Rates: Typically 10.25% to 15.00% based on credit score.\n" +
        "2. Tenure: Typically 1 to 5 years.\n" +
        "3. Quick Processing: Disbursal within hours for pre-approved salaried applicants."
      );
      return;
    }

    if ((lower.includes("this bank") || lower.includes("selected bank")) && activeBank) {
      addBotMessage(
        `🏦 Active Bank: ${activeBank}\n\n` +
        `You have currently selected ${activeBank} in FinTwin's Loans & Investments portal.\n\n` +
        `This bank offers tailored products across Housing, Personal, Vehicle, Education, and Business Loans, as well as high-yield Term Deposits.\n\n` +
        `Check the Loans & Investments tab to view all specific schemes and test your EMI eligibility against your income!`
      );
      return;
    }

    addBotMessage(
      "FinTwin Advisory Note:\n" +
      "I am ready to help you evaluate loans, investments, and interest rates across India's top 5 bank categories (Public, Private, Small Finance, Regional Rural, Cooperative). Feel free to ask about EMI calculations, CIBIL score advice, or compare specific bank products!"
    );
  }

  function addUserMessage(text) {
    const newMsg = { text: text, isUser: true };
    setMessages(prev => [...prev, newMsg]);
    handleLogic(text);
  }

  // 3. HUMAN CONVERSATION LOGIC STEPS INTEGRATED SECURELY WITH FALLBACK TO AI
  function handleLogic(userInput) {
    const input = userInput.trim();
    const lowerInput = input.toLowerCase();
    const activeBank = localStorage.getItem("fintwin_selected_bank");

    // --- 1. EMI CALCULATOR ---
    if (lowerInput.includes("calculator") || lowerInput.includes("emi")) {
      addBotMessage(
        "🧮 FinTwin EMI Calculator Quick Reference:\n" +
        "Formula: [P x R x (1+R)^N] / [(1+R)^N - 1]\n\n" +
        "Where P = Principal, R = Monthly Interest Rate, N = Tenure in Months.\n\n" +
        "For a personalized breakdown, ask me: 'Calculate EMI for 25 Lakhs at 8.5% interest for 20 years'!"
      );
      return;
    }
    
    // --- 2. ELIGIBILITY ASSESSMENT ---
    if (lowerInput.includes("eligibility") || lowerInput.includes("eligible")) {
      const income = profile?.monthlyIncome || localStorage.getItem("totalIncome") || "50000";
      const expenses = profile?.monthlyExpenses || localStorage.getItem("totalExpenses") || "25000";
      addBotMessage(
        `📋 Loan Eligibility Assessment Mode:\n` +
        `Based on your profile, your Monthly Income is ₹${income} and Expenses are ₹${expenses}.\n\n` +
        `Financial Prudence Rule: Your total loan EMIs should not exceed 40% - 50% of your net income (Max Safe EMI: ₹${(Number(income) * 0.4).toLocaleString('en-IN')}/mo).\n\n` +
        `To evaluate a specific product, select it in the Loans & Investments section to run real-time stress testing!`
      );
      return;
    }

    // --- 3. CREDIT SCORE / CIBIL ---
    if (lowerInput.includes("credit score") || lowerInput.includes("cibil")) {
      addBotMessage(
        "💳 Credit Score (CIBIL) Optimization Guide:\n" +
        "1. Maintain Credit Utilization below 30% on credit cards.\n" +
        "2. Never default or delay EMI repayment dates.\n" +
        "3. Avoid applying for multiple loans simultaneously (causes hard inquiries).\n" +
        "4. A score above 750 unlocks the lowest interest rates across Public & Private banks."
      );
      return;
    }

    // --- 4. GOVERNMENT & SOVEREIGN SCHEMES ---
    if (lowerInput.includes("scheme") || lowerInput.includes("government") || lowerInput.includes("pmay")) {
      addBotMessage(
        "🏛️ National Government Savings & Loan Schemes Hub:\n" +
        "1. Public Provident Fund (PPF): 7.1% Sovereign return, Triple Tax Exempt (EEE).\n" +
        "2. Sukanya Samriddhi Yojana (SSY): 8.2% Compound return for girl child.\n" +
        "3. Senior Citizen Savings Scheme (SCSS): 8.2% Regular quarterly income.\n" +
        "4. PMAY (Credit Linked Subsidy) for affordable housing.\n" +
        "5. PMMY (Mudra Scheme): Collateral-free micro loans up to ₹10 Lakhs."
      );
      return;
    }

    // --- 5. BANK COMPARISON ---
    if (lowerInput.includes("comparison") || lowerInput.includes("compare")) {
      addBotMessage(
        "📊 FinTwin Multi-Bank Comparison Matrix:\n" +
        "We support all 5 regulatory banking tiers in India:\n" +
        "1. Public Sector Banks (SBI, BoB, PNB, Canara, Union Bank)\n" +
        "2. Private Sector Banks (HDFC, ICICI, Axis, Kotak, IDBI)\n" +
        "3. Small Finance Banks (AU SFB, Equitas, Ujjivan, Jana)\n" +
        "4. Regional Rural Banks (Aryavart, Kerala Gramin, Baroda UP)\n" +
        "5. Cooperative Banks (Saraswat, Cosmos, SVC Bank)\n\n" +
        "Type any bank name or category to see rates and terms!"
      );
      return;
    }

    // --- 6. CHECK FOR "THIS BANK" CONTEXT ---
    if ((lowerInput.includes("this bank") || lowerInput.includes("selected bank") || lowerInput.includes("current bank")) && activeBank) {
      // Find bank data
      let foundBank = null;
      for (const cat of Object.keys(BANKS_DATA)) {
        const b = BANKS_DATA[cat].find(item => item.name.toLowerCase() === activeBank.toLowerCase() || item.shortName?.toLowerCase() === activeBank.toLowerCase());
        if (b) {
          foundBank = b;
          break;
        }
      }

      if (foundBank && foundBank.loans) {
        let details = `🏦 Current Selected Bank: ${foundBank.name}\n\nKey Loan Products Available:\n`;
        const categories = Object.keys(foundBank.loans).slice(0, 3);
        categories.forEach(cat => {
          const prods = foundBank.loans[cat].slice(0, 2);
          details += `\n• ${cat}:\n`;
          prods.forEach(p => {
            details += `  - ${p.name} (Rate: ${p.rate}% p.a.)\n`;
          });
        });
        details += `\nVisit the Loans & Investments tab to customize tenure and principal for ${foundBank.shortName || foundBank.name}!`;
        addBotMessage(details, foundBank.url, foundBank.name);
        return;
      }
    }

    // --- 7. GUIDED WORKFLOW (STEPS) ---
    if (step === "start" && (lowerInput.includes("loan") || lowerInput.includes("apply"))) {
      setStep("loanType");
      setTimeout(() => {
        addBotMessage("Sure! Please select or type the type of loan you want.\n(e.g., Home Loan, Personal Loan, Vehicle Loan, Education Loan, Business Loan)");
      }, 600);
    } 
    else if (step === "loanType") {
      setLoanType(input);
      setStep("bankCategory");
      setTimeout(() => {
        addBotMessage(
          "Which bank category do you prefer?\n\n" +
          "1. Public Sector Banks\n" +
          "2. Private Sector Banks\n" +
          "3. Small Finance Banks\n" +
          "4. Regional Rural Banks\n" +
          "5. Cooperative Banks"
        );
      }, 600);
    }
    else if (step === "bankCategory" && (
      lowerInput.includes("public") || 
      lowerInput.includes("private") || 
      lowerInput.includes("small finance") || 
      lowerInput.includes("rural") || 
      lowerInput.includes("cooperative")
    )) {
      setStep("bankSelect");
      let banksText = "";
      if (lowerInput.includes("public")) {
        banksText = "Sure! Here are leading Public Sector Banks:\n\n• SBI\n• Bank of Baroda\n• PNB\n• Canara Bank\n• Union Bank";
      } else if (lowerInput.includes("private")) {
        banksText = "Sure! Here are leading Private Sector Banks:\n\n• HDFC Bank\n• ICICI Bank\n• Axis Bank\n• Kotak Bank\n• IDBI Bank";
      } else if (lowerInput.includes("rural")) {
        banksText = "Sure! Here are leading Regional Rural Banks:\n\n• Aryavart Bank\n• Kerala Gramin Bank\n• Baroda UP Bank\n• Karnataka Gramin Bank";
      } else if (lowerInput.includes("cooperative")) {
        banksText = "Sure! Here are leading Cooperative Banks:\n\n• Saraswat Bank\n• Cosmos Bank\n• SVC Bank";
      } else {
        banksText = "Sure! Here are leading Small Finance Banks:\n\n• AU SFB\n• Equitas SFB\n• Ujjivan SFB\n• Jana SFB";
      }
      setTimeout(() => {
        addBotMessage(banksText + "\n\nPlease type the name of the bank to view loan details.");
      }, 600);
    }
    else if (step === "bankSelect" && bankData[input]) {
      showBankDetails(input);
    }
    // --- 8. FALLBACK DIRECTLY TO AI WITH CONTEXT ---
    else {
      sendMessageToAI(input);
    }
  }

  function showBankDetails(bank) {
    const info = bankData[bank];
    if (info) {
      const details = `🏦 ${bank} ${loanType || "Credit Facilities"}\n\n✔ Interest: ${info.rate}\n✔ Max Tenure: ${info.tenure}\n\nFor more details visit the official site:`;
      setTimeout(() => {
        addBotMessage(details, info.link, bank);
        setStep("start");
      }, 600);
    } else {
      sendMessageToAI(bank);
    }
  }

  const handleSend = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      addUserMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="embedded-chatbot-workspace">
      {/* Scrollable Conversation Matrix Workspace Area */}
      <div className="chat-body-stream">
        {messages.map((msg, i) => {
          let cleanLines = [];
          if (msg.text) {
            cleanLines = msg.text
              .replace(/([0-9]+\.\s+[A-Za-z])/g, "\n$1")
              .replace(/([a-z]\.\s+[A-Za-z])/g, "\n$1")
              .split("\n");
          }

          return (
            <div key={i} className={`chat-row ${msg.isUser ? "user-row" : "bot-row"}`}>
              {!msg.isUser && <div className="ai-avatar-badge">AI</div>}
              
              <div className="message-text-bubble">
                {cleanLines.map((line, index) => {
                  if (!line.trim()) return null;
                  const isListItem = /^\s*(\d+\.|[a-z]\.|[i|v|x]+\)|✔|•)/i.test(line.trim());
                  
                  return (
                    <span 
                      key={index} 
                      style={{ 
                        display: "block", 
                        marginBottom: isListItem ? "8px" : "4px",
                        paddingLeft: isListItem ? "18px" : "0px",
                        textIndent: isListItem ? "-18px" : "0px",
                        lineHeight: "1.6",
                        textAlign: "left"
                      }}
                    >
                      {line}
                    </span>
                  );
                })}
                
                {/* External Links */}
                {!msg.isUser && msg.link && (
                   <div className="link-box" style={{ marginTop: "12px" }}>
                     <a 
                       href={msg.link} 
                       target="_blank" 
                       rel="noreferrer" 
                       className="visit-btn"
                       style={{ display: "inline-block", color: "#800020", textDecoration: "underline", fontWeight: "600" }}
                     >
                       Visit {msg.bankName} Official Site ↗
                     </a>
                   </div>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="chat-row bot-row">
            <div className="ai-avatar-badge">AI</div>
            <div className="message-text-bubble loading-dots">
              <p>Thinking...</p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Persistent Form Controls Bar */}
      <form onSubmit={handleSend} className="chat-input-wrapper-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask FinTwin about loans, banks, investments, EMI..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !inputValue.trim()}>
          ➔
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
