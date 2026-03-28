import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
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
        <div className="form-card">
          <div className="title">Welcome Back</div>

          <div className="input-group">
            <input className="input" placeholder="Username" />
            <span className="icon">👤</span>
          </div>

          <div className="input-group">
            <input className="input" type="password" placeholder="Password" />
            <span className="icon">🔒</span>
          </div>

          <div className="forgot">Forgot Password?</div>

          <motion.button 
            className="btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Login
          </motion.button>

          <motion.button 
            className="btn-secondary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Login with Google
          </motion.button>

          <div className="text">
            Don’t have an account?{" "}
            <Link to="/register" className="link">
              Sign up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}