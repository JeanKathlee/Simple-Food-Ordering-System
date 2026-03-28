import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Register() {
  return (
    <div className="page">
      <motion.div 
        className="form-section"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="form-card">
          <div className="title">Create Account</div>

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
            <input className="input" type="password" placeholder="Confirm Password" />
            <span className="icon">🔒</span>
          </div>

          <motion.button 
            className="btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign up
          </motion.button>

          <div className="text">
            Already have an account?{" "}
            <Link to="/" className="link">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="image-section right"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="image-box">
          <img src="/src/assets/register-food.svg" alt="Register Illustration" />
        </div>
      </motion.div>
    </div>
  );
}