import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";
import "./auth.css";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "", 
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setToast({
        type: "error",
        title: "Validation Error",
        message: "Passwords do not match"
      });
      return;
    }

    try {
      let res;
      try {
        // Fast local registration (<200ms)
        res = await axios.post("http://localhost:5000/api/auth/register", {
          name: formData.name,
          email: formData.email,
          password: formData.password
        }, { timeout: 4000 });
      } catch (localErr) {
        // If local server responded with validation error (e.g. 400 User already exists)
        if (localErr.response) {
          throw localErr;
        }
        // Fallback only if local server is unreachable
        res = await axios.post("https://wealth-ai-backend.onrender.com/api/auth/register", {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
      }

      // In-app notification (User registered succesfully) without browser alert popup
      setToast({
        type: "success",
        title: "Registration Successful",
        message: "User registered succesfully"
      });

      // Smooth navigation to signin page
      setTimeout(() => {
        navigate("/signin");
      }, 1200);

    } catch (err) {
      setToast({
        type: "error",
        title: "Registration Failed",
        message: err.response?.data?.msg || "Registration failed. Please try again."
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
        <h2>Register</h2>

        <form onSubmit={handleSubmit}>
          <input
            className="auth-input"
            name="name"
            placeholder="Enter Full Name"
            onChange={handleChange}
            required
          />

          <input
            className="auth-input"
            name="email"
            type="email"
            placeholder="Enter Email"
            onChange={handleChange}
            required
          />

          <input
            className="auth-input"
            name="password"
            type="password"
            placeholder="Enter Password"
            onChange={handleChange}
            required
          />

          <input
            className="auth-input"
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            onChange={handleChange}
            required
          />

          <button className="auth-button">
            Sign Up
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: "2rem" }}>
          Already have an account? <Link to="/signin" className="auth-link"> Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
