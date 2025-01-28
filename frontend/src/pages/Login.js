import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
    const [step, setStep] = useState(1); // 1: Login i has³o, 2: OTP
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        if (token) {
            navigate("/dashboard");
        }
    }, [navigate]);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        if (!username.trim() || !password) {
            setError("Username and password are required!");
            return;
        }

        try {
            const response = await fetch("http://localhost/api/login_step1", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Invalid credentials!");
            } else {
                setError("");
                setStep(2); // PrzejdŸ do kroku 2
            }
        } catch (error) {
            setError("Failed to connect to the server.");
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();

        if (!otp) {
            setError("OTP is required!");
            return;
        }

        try {
            const response = await fetch("http://localhost/api/login_step2", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Invalid OTP!");
            } else {
                localStorage.setItem("jwtToken", data.token);
                setError("");
                navigate("/dashboard");
            }
        } catch (error) {
            setError("Failed to connect to the server.");
        }
    };

    const handleCancel = () => {
        setStep(1);
        setOtp("");
        setError("");
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            {step === 1 && (
                <form onSubmit={handleLoginSubmit}>
                    <div>
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <div style={{ color: "red" }}>{error}</div>}
                    <button type="submit">Next</button>
                    <p>
                        Don't have an account? <Link to="/register">Create one here</Link>
                    </p>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleOtpSubmit}>
                    <div>
                        <label htmlFor="otp">OTP:</label>
                        <input
                            type="text"
                            id="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                    </div>
                    {error && <div style={{ color: "red" }}>{error}</div>}
                    <button type="submit">Login</button>
                    <button type="button" onClick={handleCancel} className="cancel-button">
                        Cancel
                    </button>
                </form>
            )}
        </div>
    );
}

export default Login;
