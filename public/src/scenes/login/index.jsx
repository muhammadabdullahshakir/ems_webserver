import React, { useState } from 'react';
import './index.css'; 
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { tokens } from "../../theme";
import { useTheme, Button } from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';

const LoginForm = ({ setRole }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            toast.error('Please fill in both fields.');
            return;
        }

        // Basic email validation (optional)
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            toast.error('Please enter a valid email address.');
            return;
        }

        setLoading(true);
  
        try {
            // API request for login using Axios
            const response = await axios.post('http://192.168.68.226:8000/login_user/', {
                email,
                password
            });

            const { success, user_id, firstname, lastname, role, image, unique_key } = response.data;

            if (success) {
                // Save user data to localStorage
                localStorage.setItem('user', JSON.stringify({ user_id, firstname, lastname, role, image, unique_key }));
                toast.success('Login successful!');
                setRole(role)
                navigate('/dashboard'); // Redirect to dashboard
            } else {
                toast.error(response.data.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error); // Log error for debugging
            toast.error('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };
  
    return (
        <div className="login-form-container" style={{ backgroundColor: colors.primary[500] }}>
            <form onSubmit={handleSubmit}>
                <div className="container">
                    <div className="input-container">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            className="input-field"
                            placeholder="username@example.com"
                            required
                        />
                    </div>
                    <div className="input-container password-container">
                        <label>Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
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
                <button
                    style={{
                        background: colors.greenAccent[500],
                        '&:hover': { background: colors.greenAccent[900] },
                        width: '50%'
                    }}
                    type="submit"
                    className="submit-button"
                    disabled={loading} // Disable button while loading
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <div className="signup-link">
                    <span>Don't have an account? </span>
                    <Button
                        color="secondary"
                        onClick={() => { navigate('/signup') }}
                    >
                        Sign Up
                    </Button>
                </div>
            </form>
            <ToastContainer />
        </div>
    );
};

export default LoginForm;
