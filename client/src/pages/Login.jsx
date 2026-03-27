import { useState } from "react";
import api from "../api";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSignup = mode === "signup";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = isSignup
        ? { name, businessName, email, password }
        : { email, password };
      const endpoint = isSignup ? "/api/auth/register" : "/api/auth/login";
      const res = await api.post(endpoint, payload);
      onLogin(res.data.token, res.data.user);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        (isSignup ? "Signup failed. Try again." : "Login failed. Try again.");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Welcome to FinSight</h2>
        <p className="login-subtitle">
          {isSignup ? "Create your account" : "Sign in to view your dashboard"}
        </p>

        <div className="login-toggle">
          <button
            type="button"
            className={`toggle-btn ${!isSignup ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`toggle-btn ${isSignup ? "active" : ""}`}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {isSignup && (
            <>
              <label className="login-label">
                Name
                <input
                  className="login-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </label>

              <label className="login-label">
                Business (optional)
                <input
                  className="login-input"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your business"
                />
              </label>
            </>
          )}

          <label className="login-label">
            Email
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </label>

          <label className="login-label">
            Password
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button className="login-button" type="submit" disabled={loading}>
            {loading
              ? isSignup
                ? "Creating..."
                : "Signing in..."
              : isSignup
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
