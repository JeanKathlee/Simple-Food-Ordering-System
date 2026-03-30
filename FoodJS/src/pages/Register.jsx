import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Register() {
  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="auth-title">CREATE ACCOUNT</h2>

        <div className="input-group">
          <input className="input" placeholder="Username" />
          <span className="icon">👤</span>
        </div>

        <div className="row">
          <input className="input" placeholder="First Name" />
          <input className="input" placeholder="Last Name" />
        </div>

        <div className="input-group">
          <input className="input" type="password" placeholder="Password" />
          <span className="icon">🔒</span>
        </div>

        <div className="input-group">
          <input
            className="input"
            type="password"
            placeholder="Confirm Password"
          />
          <span className="icon">🔒</span>
        </div>

        <button className="btn-primary">Sign-up</button>

        <p className="text">
          Already have an account?{" "}
          <Link to="/" className="link">
            Sign-in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}