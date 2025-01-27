import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Register.css";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [qrCode, setQrCode] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username.trim() || !password || !confirmPassword) {
            setError("All fields are required!");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch("http://localhost/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const qrCodeUrl = URL.createObjectURL(blob);
                setQrCode(qrCodeUrl);
                setSuccessMessage(
                    "Registration successful! Scan the QR code to set up two-factor authentication."
                );
                setError("");
            } else {
                const data = await response.json();
                setError(data.message || "An error occurred during registration!");
            }
        } catch (error) {
            setError("Failed to connect to the server");
        }
    };

    const handleGoToLogin = () => {
        navigate("/login");
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            {qrCode ? (
                <div className="success-container">
                    <p className="success-message">{successMessage}</p>
                    <img src={qrCode} alt="QR Code" className="qr-code" />
                    <button onClick={handleGoToLogin} className="go-to-login-btn">
                        Go to Login
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="register-form">
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
                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" className="register-btn">Register</button>
                    <p>
                        Already have an account? <Link to="/login">Login here</Link>
                    </p>
                </form>
            )}
        </div>
    );
}

export default Register;
