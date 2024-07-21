import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Login.css";
import axiosInstance from "../services/axiosInstance";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignup = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (
      !trimmedFirstName ||
      !trimmedLastName ||
      !trimmedEmail ||
      !trimmedPassword ||
      !trimmedConfirmPassword
    ) {
      alert("All fields are required.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      alert("Invalid email format.");
      return;
    }

    if (trimmedPassword.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await axiosInstance.post(`/api/auth/register`, {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        password: trimmedPassword,
      });
      await login(response.data.token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup failed", error);
      if (error?.response?.data?.message === "Email is already in use.") {
        setError(error?.response?.data?.message);
      } else {
        alert("Signup failed. Please try again.");
      }
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    try {
      console.log("response", response.credential);
      const res = await axiosInstance.post("/api/auth/google", {
        token: response.credential,
      });
      await login(res.data.token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Google login failed", error);
      alert("Google login failed. Please try again.");
    }
  };

  const handleGoogleLoginFailure = (error) => {
    console.error("Google login failed", error);
    alert("Google login failed. Please try again.");
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
      Sign up with Google
    </button>
  );

  return (
    <div className="container">
      <h1 className="heading">Signup</h1>
      <div className="innerContainer">
        <input
          className="input"
          type="text"
          value={firstName}
          onChange={handleInputChange(setFirstName)}
          placeholder="First Name"
        />
        <input
          className="input"
          type="text"
          value={lastName}
          onChange={handleInputChange(setLastName)}
          placeholder="Last Name"
        />
        <input
          className="input"
          type="email"
          value={email}
          onChange={handleInputChange(setEmail)}
          placeholder="Email"
        />
        {error && <span style={{ color: "red" }}>{error}</span>}
        <input
          className="input"
          type="password"
          value={password}
          onChange={handleInputChange(setPassword)}
          placeholder="Password"
        />
        <input
          className="input"
          type="password"
          value={confirmPassword}
          onChange={handleInputChange(setConfirmPassword)}
          placeholder="Confirm Password"
        />
        <div className="noAccount">
          <span>Already have an account?</span>
          <Link to="/login">Login</Link>
        </div>
        <button onClick={handleSignup}>Signup</button>
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

export default Register;
