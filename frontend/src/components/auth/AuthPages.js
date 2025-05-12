import React, { useState } from "react";
import DemoCredentialsBox from "./DemoCredentialsBox";


import "../dashboard/dashboard.css"
import "./AuthPages.css"




import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider ,db } from "../../firebase"; 

import { doc, setDoc, getDoc  } from "firebase/firestore";



import {
  Mail,
  Lock,
  Chrome,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  ChevronLeft,
} from "lucide-react";

const AuthPages = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const navigate = useNavigate(); // React Router's navigate hook

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Google Authentication
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
  
      // Optional: Check if user profile already exists
      const profileRef = doc(db, "profiles", user.uid);
      const profileSnap = await getDoc(profileRef);
  
      if (!profileSnap.exists()) {
        // Save profile data with default name "user"
        await setDoc(profileRef, {
          email: user.email,
          name: user.email.split("@")[0],
        });
      }
  
      navigate("/", { state: { email: user.email } }); // Navigate with email
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Email/Password Authentication
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Sign in with email and password
        const result = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        navigate("/"); 
      } else {

        const result = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
      
        const user = result.user;
      
        await setDoc(doc(db, "profiles", user.uid), {
          name: formData.name,
          email: formData.email,
        });
      
        alert("Account Created Successfully!");
        setIsLogin(true);


      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setShowPassword(false);
  };

  return (
    <div>
    <div className="auth-container">
      <div className="auth-blob-1"></div>
      <div className="auth-blob-2"></div>

      <div className="auth-card glass-effect">
        <div className="auth-header">
          <div className="logo-section">
            <ChevronLeft
              className="back-arrow"
              size={24}
              onClick={() => navigate(-1)}
            />
            <h1>DevHub</h1>
          </div>
          <p className="welcome-text">
            {isLogin
              ? "Welcome back, developer!"
              : "Join the developer community"}
          </p>
        </div>


        <div className="social-auth">
          <button
            className="social-btn glass-effect text-gray-600 font-bold"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <Chrome size={20} />
            <span>{loading ? "Loading..." : "Continue with Google"}</span>
          </button>
        </div>

        <div className="divider">
          <span>or continue with email</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-wrapper glass-effect">
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper glass-effect">
              <Mail size={18} />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper glass-effect">
              <Lock size={18} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isLogin && (
            <div className="forgot-password">
              <a href="#reset">Forgot password?</a>
            </div>
          )}

          <button
            type="submit"
            className={`submit-btn ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="spinner" size={20} />
            ) : (
              <>
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={switchMode}>
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>

        {!isLogin && (
          <p className="terms">
            By signing up, you agree to our{" "}
            <a href="#terms">Terms of Service</a> and{" "}
            <a href="#privacy">Privacy Policy</a>
          </p>
        )}
      </div>
    </div>
    <DemoCredentialsBox />
    </div>
  );
};

export default AuthPages;
