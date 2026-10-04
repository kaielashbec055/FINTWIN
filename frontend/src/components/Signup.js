import React, { useState } from "react";
import "./auth.css";

function Signup() {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "", 
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      let res;
      try {
        const localRes = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password
          })
        });
        res = localRes;
      } catch (localErr) {
        res = await fetch("https://wealth-ai-backend.onrender.com/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password
          })
        });
      }

      const data = await res.json();

      if (res.ok) {
        alert("Registration successful!");
        window.location.href = "/signin";
      } else {
        setError(data.msg || "Registration failed");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Register</h2>

        {error && (
          <p style={{ color: "red", textAlign: "center" }}>
            {error}
          </p>
        )}

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

      </div>
    </div>
  );
}

export default Signup;
