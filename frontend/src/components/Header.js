import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Header.css";
import AodIcon from "@mui/icons-material/Aod";

const Header = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="main">
      <nav className="list">
        <div>
          <Link to="/dashboard">
            <AodIcon />
          </Link>
        </div>
        <div>
          {isLoggedIn ? (
            <button className="logoutbtn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <div className="beforeAuth">
              <div className="loginBtn">
                <Link to="/login">Login</Link>
              </div>
              <div>
                <Link to="/register">Signup</Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
