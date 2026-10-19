import { Link, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaGoogle, FaFacebookF, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";
import "../components/auth.css";

function Signin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [toast, setToast] = useState(null);

  // Auto-dismiss toast after 4.5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle OAuth callback redirects (Google / Facebook)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthToken = params.get("oauth_token");
    const errorMsg = params.get("error");

    if (oauthToken) {
      const user = {
        id: params.get("id") || "",
        name: params.get("name") || "",
        email: params.get("email") || "",
        age: params.get("age") || "",
        phone: params.get("phone") || "",
        occupation: params.get("occupation") || "",
        employmentType: params.get("employmentType") || "",
        city: params.get("city") || "",
        dependents: params.get("dependents") || "",
        monthlyIncome: params.get("monthlyIncome") || "",
        monthlyExpenses: params.get("monthlyExpenses") || "",
        riskTolerance: params.get("riskTolerance") || "",
        investmentTimeline: params.get("investmentTimeline") || "",
        financialGoals: params.get("financialGoals") || ""
      };

      // token save
      localStorage.setItem("token", oauthToken);

      // full user object save
      localStorage.setItem("user", JSON.stringify(user));

      // profile details save
      localStorage.setItem("userName", user.name || "");
      localStorage.setItem("userEmail", user.email || "");
      localStorage.setItem("age", user.age || "");
      localStorage.setItem("phone", user.phone || "");
      localStorage.setItem("occupation", user.occupation || "");
      localStorage.setItem("employmentType", user.employmentType || "");
      localStorage.setItem("city", user.city || "");
      localStorage.setItem("dependents", user.dependents || "");
      localStorage.setItem("totalIncome", user.monthlyIncome || "");
      localStorage.setItem("totalExpenses", user.monthlyExpenses || "");
      localStorage.setItem("riskTolerance", user.riskTolerance || "");
      localStorage.setItem("investmentHorizon", user.investmentTimeline || "");
      localStorage.setItem("financialGoal", user.financialGoals || "");

      if (user.email) {
        localStorage.setItem(`${user.email}_age`, user.age || "");
      }

      sessionStorage.setItem("justLoggedIn", "true");

      setToast({
        type: "success",
        title: "Welcome Back",
        message: "User login successfully"
      });

      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    } else if (errorMsg) {
      setToast({
        type: "error",
        title: "Authentication Notice",
        message: decodeURIComponent(errorMsg)
      });
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let res;
      try {
        // Fast local authentication (<100ms)
        res = await axios.post("http://localhost:5000/api/auth/login", form, { timeout: 4000 });
      } catch (localErr) {
        // If local server responded with standard auth validation error (e.g. 400 Invalid credentials)
        if (localErr.response) {
          throw localErr;
        }
        // Fallback only if local server is unreachable
        res = await axios.post("https://wealth-ai-backend.onrender.com/api/auth/login", form);
      }

      const user = res.data.user;

      // token save
      localStorage.setItem("token", res.data.token);

      // full user object save
      localStorage.setItem("user", JSON.stringify(user));

      // profile details save
      localStorage.setItem("userName", user.name || "");
      localStorage.setItem("userEmail", user.email || "");
      localStorage.setItem("age", user.age || "");
      localStorage.setItem("phone", user.phone || "");
      localStorage.setItem("occupation", user.occupation || "");
      localStorage.setItem("employmentType", user.employmentType || "");
      localStorage.setItem("city", user.city || "");
      localStorage.setItem("dependents", user.dependents || "");
      localStorage.setItem("totalIncome", user.monthlyIncome || "");
      localStorage.setItem("totalExpenses", user.monthlyExpenses || "");
      localStorage.setItem("riskTolerance", user.riskTolerance || "");
      localStorage.setItem("investmentHorizon", user.investmentTimeline || "");
      localStorage.setItem("financialGoal", user.financialGoals || "");

      // Sync specific email keys with Homepage component expectations
      if (user.email) {
        localStorage.setItem(`${user.email}_age`, user.age || "");
      }

      // Set session indicator flag to tell Profile component to display block panels
      sessionStorage.setItem("justLoggedIn", "true");

      // In-app notification (User login successfully) instead of browser alert popup
      setToast({
        type: "success",
        title: "Success",
        message: "User login successfully"
      });

      // Smooth transition to profile page
      setTimeout(() => {
        navigate("/profile");
      }, 1000);

    } catch (err) {
      setToast({
        type: "error",
        title: "Sign In Failed",
        message: err.response?.data?.msg || "Invalid credentials"
      });
    }
  };

  return (
    <div className="auth-container">
      {toast && (
        <div className="auth-toast-container">
          <div className={`auth-toast ${toast.type}`}>
            <div className="auth-toast-icon">
              {toast.type === "success" && <FaCheckCircle />}
              {toast.type === "error" && <FaExclamationCircle />}
              {toast.type === "info" && <FaInfoCircle />}
            </div>
            <div className="auth-toast-content">
              <div className="auth-toast-title">{toast.title || (toast.type === "success" ? "Success" : "Notice")}</div>
              <div className="auth-toast-msg">{toast.message}</div>
            </div>
            <button className="auth-toast-close" onClick={() => setToast(null)} title="Close notification">
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <div className="auth-card">
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <input className="auth-input" name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
          <input className="auth-input" name="password" type="password" placeholder="Password" onChange={handleChange} required />
          <button className="auth-button">Sign In</button>
        </form>

        <div className="social-divider"></div>
        <div className="social-icons-wrapper">
          <a href="http://localhost:5000/api/auth/google" className="social-icon-btn google" title="Sign in with Google">
            <FaGoogle />
          </a>
          <a href="http://localhost:5000/api/auth/facebook" className="social-icon-btn facebook" title="Sign in with Facebook">
            <FaFacebookF />
          </a>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup" className="auth-link"> Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Signin;
