import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { isAuthenticated, saveAuthSession } from "../lib/auth";
import logo from "../../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.message || "Unable to login right now.");
        return;
      }

      saveAuthSession({ token: payload.token, user: payload.user });
      navigate("/dashboard", { replace: true });
    } catch (_networkError) {
      setError("Cannot connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.form
        className="auth-card"
        onSubmit={handleLogin}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="auth-brand">
          <img className="auth-logo" src={logo} alt="FoodJS logo" />
        </div>

        <h2 className="auth-title">LOGIN</h2>

        <div className="input-group">
          <input
            className="input"
            type="email"
            placeholder="Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <span className="icon">👤</span>
        </div>

        <div className="input-group">
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className="icon">🔒</span>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="forgot">Forgot Password?</div>

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <button className="btn-secondary" type="button">
          Login with Google
        </button>

        <p className="text">
          Don’t have an account?{" "}
          <Link to="/register" className="link">
            Sign Up
          </Link>
        </p>
      </motion.form>
    </div>
  );
}