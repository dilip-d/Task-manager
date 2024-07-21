import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Login.css";
import axiosInstance from "../services/axiosInstance";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Email and password are required.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError("Invalid email format.");
      return;
    }

    try {
      const response = await axiosInstance.post("/api/auth/login", {
        email: trimmedEmail,
        password: trimmedPassword,
      });
      login(response.data.token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed", error);
      setError("Login failed. Please check your credentials and try again.");
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    console.log("response", response.credential);
    try {
      const res = await axiosInstance.post("/api/auth/google", {
        token: response.credential,
      });
      login(res.data.token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Google login failed", error);
      setError("Google login failed. Please try again.");
    }
  };

  const handleGoogleLoginFailure = (error) => {
    console.error("Google login failed", error);
    setError("Google login failed. Please try again.");
  };

  const handleInputChange = (setter) => (e) => {
    setError("");
    setter(e.target.value);
  };

  const CustomGoogleButton = ({ onClick }) => (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px",
        backgroundColor: "#4285F4",
        color: "white",
        border: "none",
        borderRadius: "4px",
      }}
    >
      Login with Google
    </button>
  );

  return (
    <div className="container">
      <h1 className="heading">Login</h1>
      <div className="innerContainer">
        <input
          className="input"
          type="email"
          value={email}
          onChange={handleInputChange(setEmail)}
          placeholder="Email"
        />
        <input
          className="input"
          type="password"
          value={password}
          onChange={handleInputChange(setPassword)}
          placeholder="Password"
        />
        {error && <span style={{ color: "red" }}>{error}</span>}
        <div className="noAccount">
          <span>Don't have an account?</span>
          <Link to="/register">Signup</Link>
        </div>
        <button onClick={handleLogin}>Login</button>
        <div className="googleBtnContainer">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginFailure}
            render={(renderProps) => (
              <CustomGoogleButton onClick={renderProps.onClick} />
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
