import React, { useState } from "react";
import "./index.css";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { tokens } from "../../theme";
import { useTheme} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axios from "axios";
import urls from "../urls/urls";

const LoginForm = ({ setRole }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form fields
    if (!email || !password) {
      toast.error("Please fill in both fields.");
      return;
    }

    // Basic email validation (optional)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
    
      const response = await axios.post(urls.loginUser, {
        email,
        password,
      });

      const { success, user_id, firstname, lastname, role, image, unique_key } =
        response.data;

      if (success) {
        // Save user data to localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({
            user_id,
            firstname,
            lastname,
            role,
            image,
            unique_key,
            email,
          })
        );
        toast.success("Login successful!");
        setRole(role);
        navigate("/dashboard"); 
      } else {
        toast.error(response.data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error); 
      toast.error("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-form-container"
      style={{ backgroundColor: colors.primary[500] }}
    >
      <form
        onSubmit={handleSubmit}
        style={{ backgroundColor: colors.primary[400] }}
      >
        <div className="container">
          <div className="input-container">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              className="input-field"
              placeholder="Email"
              required
            />
          </div>
          <>
            <div className="input-container password-container">
              <label>Password</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  className="input-field"
                  placeholder="Password"
                  required
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </span>
              </div>
            </div>
            <style jsx="true">{`
              .input-container {
                display: flex;
                flex-direction: column;
                margin-bottom: 16px;
              }

              .input-wrapper {
                position: relative;
                display: flex;
                align-items: center;
                width: 100%;
              }

              .input-field {
                flex: 1;
                padding-right: 40px;
                padding-left: 10px;
                padding-top: 10px;
                padding-bottom: 10px;
                border: 1px solid #ccc;
                border-radius: 4px;
                font-size: 16px;
                box-sizing: border-box;
              }

              .password-toggle {
                position: absolute;
                right: 10px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                padding-top: 18px;

                z-index: 10;
              }

              .password-toggle svg {
                font-size: 20px;
                color: #888;
              }

              .password-toggle:hover svg {
                color: #333;
              }
            `}</style>
          </>
        </div>
        <button
          style={{
            background: colors.greenAccent[500],
            "&:hover": { background: colors.blueAccent[900] },
            width: "50%",
          }}
          type="submit"
          className="submit-button"
          disabled={loading} 
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default LoginForm;
