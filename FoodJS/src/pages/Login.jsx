import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { isAuthenticated, saveAuthSession } from "../lib/auth";

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
    <div className="page">
      <motion.div 
        className="image-section left"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="image-box">
          <img src="/src/assets/login-food.svg" alt="Login Illustration" />
        </div>
      </motion.div>

      <motion.div 
        className="form-section"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <form className="form-card" onSubmit={handleLogin}>
          <div className="title">Welcome Back</div>
          <p className="text demo-creds">Demo: admin@food.local / admin123</p>

          <div className="input-group">
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <span className="icon">🔒</span>
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="forgot">Forgot Password?</div>

          <motion.button 
            className="btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>

          <motion.button 
            className="btn-secondary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
          >
            Login with Google
          </motion.button>

          <div className="text">
            Don’t have an account?{" "}
            <Link to="/register" className="link">
              Sign up
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}