import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        if (token) {
            navigate("/dashboard"); // Automatyczne przekierowanie, jeœli zalogowany
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Walidacja pól
        if (!username.trim() || !password || !otp) {
            setError("All fields are required!");
            return;
        }

        try {
            const response = await fetch("http://localhost/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "An error occurred during login!");
            } else {
                localStorage.setItem("jwtToken", data.token);
                setError("");
                navigate("/dashboard");
            }
        } catch (error) {
            setError("Failed to connect to the server");
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
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
            </form>
            <p>
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    );
}

export default Login;
