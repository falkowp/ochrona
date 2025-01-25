import React, { useState } from "react";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); // Stan na przechowywanie b��du

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prosta walidacja (sprawdzenie, czy dane nie s� puste)
        if (!username || !password) {
            setError("Both username and password are required!");
            return;
        }

        try {
            const response = await fetch("http://localhost/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Je�eli odpowied� backendu jest b��dna
                setError(data.message || "An error occurred during login!");
            } else {
                // Przechodzimy dalej, je�li logowanie by�o udane
                setError(""); // Resetujemy b��d
                console.log("Login successful", data);
            }
        } catch (error) {
            // W przypadku problemu z po��czeniem z backendem
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
                {error && <div style={{ color: "red" }}>{error}</div>} {/* Pokazujemy b��d */}
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;
