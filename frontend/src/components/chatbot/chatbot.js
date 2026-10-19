import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Sparkles, 
  X, 
  RotateCcw, 
  Send, 
  ChevronDown, 
  ExternalLink,
  ShieldCheck,
  Landmark
} from "lucide-react";
import "./chatbot.css";
import { generateFinTwinAdvisory } from "../../utils/financialKnowledgeEngine";


const Chatbot = ({ userName, profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const initialized = useRef(false);

  // Active bank context from Loans & Investments
  const activeBank = localStorage.getItem("fintwin_selected_bank") || "";
  const bankCategory = localStorage.getItem("fintwin_selected_bank_category") || "";

  // 1. DYNAMIC INITIAL GREETING
  useEffect(() => {
    if (!initialized.current) {
      const displayName = userName || localStorage.getItem("userName") || "Friend";
      setMessages([
        {
          id: 1,
          text: `Hi ${displayName}! 👋 Welcome to FinTwin AI Advisor.\n\nI can calculate loan EMIs, compare bank interest rates, explain SIP compounding, guide you on Section 80C tax savings, and find eligible government welfare schemes for you.\n\nHow can I help you today?`,
          isUser: false,
          link: "",
          bankName: ""
        }
      ]);
      initialized.current = true;
    }
  }, [userName]);

  // SMOOTH SCROLL TO LATEST MESSAGE
  useEffect(() => {
    if (isOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  // Helper to add bot message
  const addBotResponse = (text, link = "", bankName = "") => {
    const cleanedText = text ? text.replace(/₹₹/g, "₹") : "";
    setMessages(prev => [
      ...prev, 
      { id: Date.now(), text: cleanedText, isUser: false, link, bankName }
    ]);
  };

  // 2. DISPATCH QUERY (Backend API with Instant Deterministic Engine Fallback)
  const processQuery = async (queryText) => {
    const trimmed = queryText.trim();
    if (!trimmed || isLoading) return;

    // Add user message
    const userMsg = { id: Date.now(), text: trimmed, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    const token = localStorage.getItem("token");
    const payload = {
      message: trimmed,
      userProfile: profile,
      selectedBank: activeBank,
      bankCategory: bankCategory,
      geminiApiKey: localStorage.getItem("fintwin_gemini_api_key") || "",
      openaiApiKey: localStorage.getItem("fintwin_openai_api_key") || ""
    };

    let reply = "";
    let link = "";
    let bankName = "";

    try {
      // 1. Try local backend
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token || "",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4500)
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.reply) {
          reply = data.reply;
        }
      }
    } catch (e) {
      // Local backend offline or timeout, proceed to hosted / local engine
    }

    // 2. If no reply, try hosted backend with short timeout
    if (!reply) {
      try {
        const hostedRes = await fetch("https://wealth-ai-backend.onrender.com/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token || "",
            "Authorization": token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(4000)
        });
        if (hostedRes.ok) {
          const hostedData = await hostedRes.json();
          if (hostedData && hostedData.reply) {
            reply = hostedData.reply;
          }
        }
      } catch (hostedErr) {
        // Hosted backend unavailable, use built-in engine
      }
    }

    // 3. Resilient Built-in Knowledge Engine (Guarantees immediate, accurate response)
    if (!reply) {
      reply = generateFinTwinAdvisory(trimmed, activeBank, profile);
    }

    setIsLoading(false);
    addBotResponse(reply, link, bankName);
  };

  const handleSend = (e) => {
    e.preventDefault();
    processQuery(inputValue);
  };


  const handleResetChat = () => {
    const displayName = userName || localStorage.getItem("userName") || "Friend";
    setMessages([
      {
        id: Date.now(),
        text: `Chat reset! Hi ${displayName}, what financial topic or calculation would you like to explore?`,
        isUser: false
      }
    ]);
  };

  return (
    <>
      {/* 1. FLOATING CHAT TRIGGER BUTTON */}
      {!isOpen && (
        <button 
          className="chatbot-floating-trigger"
          onClick={() => setIsOpen(true)}
          title="Chat with FinTwin AI Financial Advisor"
          aria-label="Open FinTwin AI Chat"
        >
          <div className="trigger-icon-pulse"></div>
          <Sparkles size={22} className="trigger-sparkle-icon" />
          <span className="trigger-label">AI Advisor</span>
        </button>
      )}

      {/* 2. CHATBOT WINDOW POPUP */}
      {isOpen && (
        <div className="chatbot-window-card">
          {/* HEADER BAR */}
          <div className="chatbot-header-bar">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar-ring">
                <Sparkles size={16} />
              </div>
              <div className="chatbot-header-info">
                <h4>FinTwin AI Advisor</h4>
                <div className="chatbot-status-row">
                  <span className="status-online-dot"></span>
                  <span className="status-text">Live • Financial Intelligence</span>
                </div>
              </div>
            </div>

            <div className="chatbot-header-actions">
              <button 
                type="button" 
                onClick={handleResetChat} 
                className="chatbot-header-btn" 
                title="Reset conversation"
              >
                <RotateCcw size={16} />
              </button>
              <button 
                type="button" 
                onClick={() => setIsOpen(false)} 
                className="chatbot-header-btn" 
                title="Minimize chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* MESSAGE STREAM FEED */}
          <div className="chatbot-stream-area">
            {messages.map((msg) => {
              const lines = (msg.text || "").split("\n");

              return (
                <div 
                  key={msg.id} 
                  className={`chat-message-row ${msg.isUser ? "chat-user-msg" : "chat-bot-msg"}`}
                >
                  {!msg.isUser && (
                    <div className="bot-avatar-badge">
                      <Sparkles size={12} />
                    </div>
                  )}

                  <div className="chat-bubble-container">
                    {lines.map((line, lIdx) => {
                      if (!line.trim()) return <div key={lIdx} style={{ height: "6px" }} />;
                      const isTitleOrHeader = /^\d+\.\s+/.test(line.trim());
                      const isBullet = /^(\*|-|•|✔|✅|⚠️)\s+/.test(line.trim());

                      return (
                        <div 
                          key={lIdx} 
                          className={`bubble-line ${isTitleOrHeader ? "bubble-header-line" : ""} ${isBullet ? "bubble-bullet-line" : ""}`}
                        >
                          {line}
                        </div>
                      );
                    })}

                    {msg.link && (
                      <div className="bubble-external-link-wrap">
                        <a 
                          href={msg.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="bubble-action-link"
                        >
                          Visit {msg.bankName || "Official Portal"} <ExternalLink size={13} style={{ marginLeft: "4px" }} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="chat-message-row chat-bot-msg">
                <div className="bot-avatar-badge">
                  <Sparkles size={12} />
                </div>
                <div className="chat-bubble-container loading-bubble">
                  <span className="dot-typing-indicator"></span>
                  <span className="dot-typing-indicator"></span>
                  <span className="dot-typing-indicator"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* INPUT FORM CONTROLS */}
          <form onSubmit={handleSend} className="chatbot-input-row">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about loans, EMI, taxes, SIP..."
              className="chatbot-text-input"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="chatbot-send-button"
              disabled={isLoading || !inputValue.trim()}
              title="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
