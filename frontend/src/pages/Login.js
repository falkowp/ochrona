import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";  // Importujemy useNavigate

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();  // Hook do przekierowywania po udanym logowaniu

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setError("Both username and password are required!");
            return;
        }

        try {
            const response = await fetch("http://localhost/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "An error occurred during login!");
            } else {
                setError("");
                console.log("Login successful", data);
                // Po udanym logowaniu przekierowujemy na Dashboard
                navigate("/dashboard");
            }
        } catch (error) {
            setError("Failed to connect to the server");
        }
    };

    return (
        <div>
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
