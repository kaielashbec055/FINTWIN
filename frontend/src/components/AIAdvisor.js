/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Search, 
  Sparkles, 
  ArrowUp, 
  Paperclip, 
  Copy, 
  FileText, 
  ArrowRight,
  Landmark,
  ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import './AIAdvisor.css';
import { useLanguage } from '../context/LanguageContext';
import { generateFinTwinAdvisory } from '../utils/financialKnowledgeEngine';

export default function AIAdvisor({ profile }) {
  const { t } = useLanguage();

  // Load chat sessions from localStorage or initialize with a default session
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem("fintwin_ai_sessions");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load chat sessions:", e);
    }
    return [
      {
        id: "default_session",
        title: "Financial Strategy & Wealth",
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: 1,
            sender: "ai",
            text: "Welcome to FinTwin AI Advisor! I am your personal financial assistant across Indian commercial banks, loans, investment portfolios, and government schemes. How can I help you optimize your capital today?"
          }
        ]
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    const lastActive = localStorage.getItem("fintwin_active_session_id");
    return lastActive || "default_session";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const [inputMessage, setInputMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Active bank context from Loans & Investments
  const activeBank = localStorage.getItem("fintwin_selected_bank") || "";
  const bankCategory = localStorage.getItem("fintwin_selected_bank_category") || "";

  // Active conversation session
  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("fintwin_ai_sessions", JSON.stringify(sessions));
      localStorage.setItem("fintwin_active_session_id", activeSessionId);
    } catch (e) {
      console.error("Failed to save sessions:", e);
    }
  }, [sessions, activeSessionId]);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [inputMessage]);

  // Create a brand new chat session
  const handleNewChat = () => {
    const newId = `session_${Date.now()}`;
    const newSession = {
      id: newId,
      title: "New Conversation",
      updatedAt: new Date().toISOString(),
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setInputMessage("");
    setAttachedFile(null);
  };

  // Delete a chat session
  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== sessionId);
    if (updated.length === 0) {
      // Re-initialize if all deleted
      const freshId = `session_${Date.now()}`;
      const freshSession = {
        id: freshId,
        title: "New Conversation",
        updatedAt: new Date().toISOString(),
        messages: []
      };
      setSessions([freshSession]);
      setActiveSessionId(freshId);
    } else {
      setSessions(updated);
      if (activeSessionId === sessionId) {
        setActiveSessionId(updated[0].id);
      }
    }
  };

  // Start renaming a session
  const handleStartRename = (e, session) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  // Save renamed session title
  const handleSaveRename = (e, sessionId) => {
    e.stopPropagation();
    if (!editingTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: editingTitle.trim() } : s));
    setEditingSessionId(null);
  };

  // Handle file attachment
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isText = file.type.includes("text") || file.name.endsWith(".txt") || file.name.endsWith(".csv") || file.name.endsWith(".json");
      if (isText) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setAttachedFile({ name: file.name, size: `${(file.size / 1024).toFixed(1)} KB`, isText: true, content: event.target.result });
        };
        reader.readAsText(file);
      } else {
        setAttachedFile({ name: file.name, size: `${(file.size / 1024).toFixed(1)} KB`, isText: false });
      }
    }
  };

  // Dispatch message to AI Advisor
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query && !attachedFile) return;

    const userMsgId = Date.now();
    const userMsg = {
      id: userMsgId,
      sender: "user",
      text: query,
      file: attachedFile ? { name: attachedFile.name, size: attachedFile.size } : null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update session title automatically if this is the first user message
    const isFirstUserMessage = messages.filter(m => m.sender === "user").length === 0;
    const sessionTitle = isFirstUserMessage ? (query.slice(0, 30) || "Financial Query") : currentSession.title;

    // Add user message to session
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          title: sessionTitle,
          updatedAt: new Date().toISOString(),
          messages: [...s.messages, userMsg]
        };
      }
      return s;
    }));

    setInputMessage("");
    const fileToSend = attachedFile;
    setAttachedFile(null);
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      let apiMessage = query;
      if (fileToSend) {
        if (fileToSend.isText && fileToSend.content) {
          apiMessage = `[Attached Document: ${fileToSend.name}]\nContent:\n${fileToSend.content}\n\nUser Query: ${query || "Please analyze this document."}`;
        } else {
          apiMessage = `[Attached Document: ${fileToSend.name} (${fileToSend.size})]\n\nUser Query: ${query || "Please review this financial file."}`;
        }
      }

      const chatPayload = {
        message: apiMessage,
        userProfile: profile,
        selectedBank: activeBank,
        bankCategory: bankCategory
      };

      let replyText = "";
      try {
        const localRes = await axios.post("http://localhost:5000/api/chat", chatPayload, {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token || "",
            "Authorization": token ? `Bearer ${token}` : ""
          },
          timeout: 5000
        });
        if (localRes.data?.reply) {
          replyText = localRes.data.reply;
        }
      } catch (err) {
        // Fallback to hosted backend
        try {
          const hostedRes = await axios.post("https://wealth-ai-backend.onrender.com/api/chat", chatPayload, {
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token || "",
              "Authorization": token ? `Bearer ${token}` : ""
            },
            timeout: 8000
          });
          if (hostedRes.data?.reply) {
            replyText = hostedRes.data.reply;
          }
        } catch (hErr) {
          console.warn("Both backends offline, utilizing FinTwin local advisor engine");
        }
      }

      // If backend was unreachable, apply FinTwin smart offline guidance
      if (!replyText) {
        replyText = generateSmartOfflineGuidance(query, activeBank, profile);
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            updatedAt: new Date().toISOString(),
            messages: [...s.messages, aiMsg]
          };
        }
        return s;
      }));

    } catch (error) {
      console.error("AI Advisor error:", error);
      const errorMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: "I encountered a telemetry communication error. Please ensure your backend is active on port 5000.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...s.messages, errorMsg] };
        }
        return s;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard shortcut: Enter to send, Shift+Enter for newline
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Copy message text to clipboard
  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Filtered session list for search
  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="advisor-container">
      {/* 1. LEFT SIDEBAR / CHAT HISTORY DRAWER */}
      <div className="advisor-history-sidebar">
        <button className="new-chat-btn" onClick={handleNewChat}>
          <Plus size={16} /> {t("ai_new_chat", "New Chat")}
        </button>

        <div className="search-chat-wrapper">
          <Search size={14} className="search-chat-icon" />
          <input 
            type="text" 
            placeholder={t("ai_search_chats", "Search chats...")} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-chat-input"
          />
        </div>

        <div className="history-section-label">
          {t("ai_chat_history", "Recent Conversations")}
        </div>

        <div className="chat-history-list">
          {filteredSessions.length === 0 ? (
            <div className="empty-history-note">
              {t("ai_no_chats", "No chats found")}
            </div>
          ) : (
            filteredSessions.map(session => (
              <div 
                key={session.id} 
                className={`history-item ${session.id === activeSessionId ? 'active' : ''}`}
                onClick={() => setActiveSessionId(session.id)}
              >
                <div className="history-item-left">
                  <MessageSquare size={14} className="history-item-icon" />
                  {editingSessionId === session.id ? (
                    <input 
                      type="text" 
                      value={editingTitle} 
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(e, session.id);
                        if (e.key === 'Escape') setEditingSessionId(null);
                      }}
                      autoFocus
                      style={{ fontSize: "0.82rem", padding: "2px 4px", border: "1px solid #800020", borderRadius: "4px", width: "130px" }}
                    />
                  ) : (
                    <span className="history-item-title">{session.title}</span>
                  )}
                </div>

                <div className="history-item-actions">
                  {editingSessionId === session.id ? (
                    <>
                      <button className="history-action-btn" onClick={(e) => handleSaveRename(e, session.id)} title="Save title">
                        <Check size={13} color="#059669" />
                      </button>
                      <button className="history-action-btn" onClick={(e) => { e.stopPropagation(); setEditingSessionId(null); }} title="Cancel">
                        <X size={13} color="#dc2626" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="history-action-btn" onClick={(e) => handleStartRename(e, session)} title="Rename chat">
                        <Edit2 size={13} />
                      </button>
                      <button className="history-action-btn" onClick={(e) => handleDeleteSession(e, session.id)} title="Delete chat">
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {activeBank && (
          <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Active Bank</span>
            <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#800020", marginTop: "2px" }}>
              {activeBank}
            </div>
          </div>
        )}
      </div>

      {/* 2. MAIN CHAT AREA */}
      <div className="advisor-main-area">
        <div className="advisor-header-bar">
          <div className="advisor-title-box">
            <div className="advisor-badge-avatar">AI</div>
            <div className="advisor-title-text">
              <h3>FinTwin AI Advisor</h3>
              <span>Objective Financial Intelligence across Indian Banking & Wealth</span>
            </div>
          </div>

          {activeBank ? (
            <div className="context-tag-pill">
              <Landmark size={14} /> Active Context: {activeBank}
            </div>
          ) : (
            <div className="context-tag-pill" style={{ color: "#059669", background: "#ecfdf5", borderColor: "#a7f3d0" }}>
              <ShieldCheck size={14} /> Universal Financial Mode
            </div>
          )}
        </div>

        {/* 3. MESSAGE STREAM OR EMPTY STATE */}
        <div className="chat-messages-viewport">
          {messages.length === 0 ? (
            <div className="advisor-empty-state">
              <div className="empty-state-icon-circle">
                <Sparkles size={28} />
              </div>
              <h2>{t("ai_welcome_title", "How can I help you manage your finances today?")}</h2>
              <p>
                {t("ai_welcome_desc", "I am your FinTwin AI Financial Advisor. Ask me anything about Indian banks, loan eligibility, investment portfolios, government schemes, or financial planning.")}
              </p>

              <div className="empty-suggestions-grid">
                <div 
                  className="suggestion-card" 
                  onClick={() => handleSendMessage("Compare SBI vs HDFC Home Loans with interest rates")}
                >
                  <span>Compare SBI vs HDFC Home Loans</span>
                  <ArrowRight size={14} className="suggestion-card-arrow" />
                </div>

                <div 
                  className="suggestion-card" 
                  onClick={() => handleSendMessage("How much emergency fund do I need based on my monthly expenses?")}
                >
                  <span>How much emergency fund do I need?</span>
                  <ArrowRight size={14} className="suggestion-card-arrow" />
                </div>

                <div 
                  className="suggestion-card" 
                  onClick={() => handleSendMessage("Which government schemes offer the highest risk-free returns for common citizens?")}
                >
                  <span>Top government wealth schemes</span>
                  <ArrowRight size={14} className="suggestion-card-arrow" />
                </div>

                <div 
                  className="suggestion-card" 
                  onClick={() => handleSendMessage("Calculate EMI for ₹25 Lakhs at 8.5% interest for 20 years")}
                >
                  <span>Calculate EMI for ₹25 Lakhs at 8.5% for 20y</span>
                  <ArrowRight size={14} className="suggestion-card-arrow" />
                </div>
              </div>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`chat-turn-row ${msg.sender}`}>
                <div className="turn-avatar">
                  {msg.sender === "user" ? (profile?.name ? profile.name.charAt(0).toUpperCase() : "U") : "AI"}
                </div>
                <div className="turn-bubble">
                  {msg.file && (
                    <div className="turn-bubble-file">
                      <FileText size={14} />
                      <span>{msg.file.name} ({msg.file.size})</span>
                    </div>
                  )}

                  {(() => {
                    const lines = (msg.text || "").split("\n");
                    return lines.map((line, idx) => {
                      const trimmed = line.trim();
                      if (!trimmed) {
                        return <div key={idx} style={{ height: "6px" }} />;
                      }
                      const renderInline = (str) => {
                        const parts = str.split(/(\*\*.*?\*\*)/g);
                        return parts.map((part, pIdx) => {
                          if (part.startsWith("**") && part.endsWith("**")) {
                            return (
                              <strong 
                                key={pIdx} 
                                style={{ 
                                  fontWeight: 700, 
                                  color: msg.sender === "user" ? "#ffffff" : "#0f172a" 
                                }}
                              >
                                {part.slice(2, -2)}
                              </strong>
                            );
                          }
                          return part;
                        });
                      };

                      if (trimmed.startsWith("### ")) {
                        return (
                          <h4 
                            key={idx} 
                            style={{ 
                              margin: "12px 0 6px 0", 
                              fontSize: "0.98rem", 
                              fontWeight: 700, 
                              color: msg.sender === "user" ? "#93c5fd" : "#800020" 
                            }}
                          >
                            {trimmed.replace("### ", "")}
                          </h4>
                        );
                      }

                      if (trimmed.startsWith("## ")) {
                        return (
                          <h3 
                            key={idx} 
                            style={{ 
                              margin: "14px 0 6px 0", 
                              fontSize: "1.08rem", 
                              fontWeight: 800, 
                              color: msg.sender === "user" ? "#bfdbfe" : "#1e293b" 
                            }}
                          >
                            {trimmed.replace("## ", "")}
                          </h3>
                        );
                      }

                      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                        return (
                          <div 
                            key={idx} 
                            style={{ 
                              display: "flex", 
                              gap: "8px", 
                              margin: "3px 0", 
                              paddingLeft: "4px" 
                            }}
                          >
                            <span style={{ color: msg.sender === "user" ? "#60a5fa" : "#800020", fontWeight: "bold" }}>•</span>
                            <span style={{ flex: 1 }}>{renderInline(trimmed.substring(2))}</span>
                          </div>
                        );
                      }

                      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
                      if (numMatch) {
                        return (
                          <div 
                            key={idx} 
                            style={{ 
                              display: "flex", 
                              gap: "8px", 
                              margin: "4px 0", 
                              paddingLeft: "4px" 
                            }}
                          >
                            <span 
                              style={{ 
                                color: msg.sender === "user" ? "#93c5fd" : "#800020", 
                                fontWeight: 700, 
                                minWidth: "18px" 
                              }}
                            >
                              {numMatch[1]}.
                            </span>
                            <span style={{ flex: 1 }}>{renderInline(numMatch[2])}</span>
                          </div>
                        );
                      }

                      return (
                        <p key={idx} style={{ margin: "0 0 6px 0", lineHeight: "1.6" }}>
                          {renderInline(line)}
                        </p>
                      );
                    });
                  })()}

                  <div className="turn-bubble-footer">
                    {msg.timestamp && (
                      <span style={{ fontSize: "0.7rem", color: msg.sender === "user" ? "#94a3b8" : "#94a3b8" }}>
                        {msg.timestamp}
                      </span>
                    )}
                    {msg.sender === "ai" && (
                      <button 
                        className="bubble-action-btn"
                        onClick={() => handleCopy(msg.id, msg.text)}
                        title="Copy text"
                      >
                        {copiedMsgId === msg.id ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                        <span>{copiedMsgId === msg.id ? "Copied" : "Copy"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="chat-turn-row ai">
              <div className="turn-avatar">AI</div>
              <div className="turn-bubble">
                <div className="typing-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <span style={{ fontSize: "0.82rem", color: "#64748b", marginLeft: "6px" }}>
                    {t("ai_thinking", "FinTwin AI is analyzing financial models...")}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 4. CHATGPT-STYLE BOTTOM INPUT BAR */}
        <div className="advisor-input-container">
          {attachedFile && (
            <div className="attached-file-preview-strip">
              <FileText size={14} color="#800020" />
              <span>{attachedFile.name} ({attachedFile.size})</span>
              <button className="remove-file-pill-btn" onClick={() => setAttachedFile(null)}>×</button>
            </div>
          )}

          <div className="chat-input-bar-modern">
            <div className="chat-input-actions-left">
              <input 
                type="file" 
                id="ai-advisor-file-input" 
                style={{ display: "none" }} 
                onChange={handleFileChange}
              />
              <label htmlFor="ai-advisor-file-input" className="chat-attach-btn" title="Attach document or statement">
                <Paperclip size={18} />
              </label>
            </div>

            <textarea 
              ref={textareaRef}
              rows="1"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("ai_placeholder", "Ask FinTwin about loans, investments, schemes, EMI calculation, or financial advice...")}
              className="chat-input-textarea"
              disabled={isLoading}
            />

            <button 
              type="button" 
              onClick={() => handleSendMessage()}
              disabled={!(inputMessage.trim() || attachedFile) || isLoading}
              className={`chat-send-circle-btn ${(inputMessage.trim() || attachedFile) && !isLoading ? 'active' : ''}`}
            >
              <ArrowUp size={18} />
            </button>
          </div>

          <div className="advisor-disclaimer-note">
            FinTwin AI provides general financial advisory information. Review official loan sanction and scheme prospectuses before executing contracts.
          </div>
        </div>
      </div>
    </div>
  );
}

// Smart Financial Advisor Knowledge Engine
function generateSmartOfflineGuidance(query, activeBank, profile) {
  return generateFinTwinAdvisory(query, activeBank, profile);
}
