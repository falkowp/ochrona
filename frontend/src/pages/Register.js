import React, { useState } from "react";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [qrCode, setQrCode] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password || !confirmPassword) {
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
                setSuccess(true);
                setError("");
            } else {
                const data = await response.json();
                setError(data.message || "An error occurred during registration!");
            }
        } catch (error) {
            setError("Failed to connect to the server");
        }
    };

    return (
        <div>
            <h2>Register</h2>
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
                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                {error && <div style={{ color: "red" }}>{error}</div>}
                {success && (
                    <div style={{ color: "green" }}>
                        Registration successful! Scan the QR code to set up OTP.
                    </div>
                )}
                <button type="submit">Register</button>
            </form>
            {qrCode && (
                <div>
                    <h3>Scan this QR code with your OTP app:</h3>
                    <img src={qrCode} alt="QR Code" />
                </div>
            )}
        </div>
    );
}

export default Register;
