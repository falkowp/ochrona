import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

function Dashboard() {
    const [messages, setMessages] = useState([]);
    const [username, setUsername] = useState(""); // Dodano stan na username
    const navigate = useNavigate();
    const token = localStorage.getItem("jwtToken");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        // Dekodowanie tokena JWT w celu pobrania nazwy u¿ytkownika
        try {
            const payload = JSON.parse(
                atob(token.split(".")[1]) // Rozdzielamy token na czêœci i dekodujemy Base64
            );
            setUsername(payload.username);
        } catch (error) {
            console.error("Invalid token:", error);
            navigate("/login");
        }
    }, [navigate, token]);

    useEffect(() => {
        if (!token) return;

        fetch("/api/messages", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setMessages(data.messages || []);
            })
            .catch((error) => console.error("Error fetching messages:", error));
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        navigate("/login");
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="user-profile">
                    <h1>Hello, {username}!</h1>
                </div>
                <button className="logout-button" onClick={handleLogout}>
                    Log out
                </button>
            </div>

            <Link to="/addmsg" className="add-message-button">
                Create new post
            </Link>

            {messages.length === 0 ? (
                <p className="no-messages">Nothing to see here...</p>
            ) : (
                messages.map((msg) => (
                    <div key={msg.id} className="message-container">
                        <div className="message-text">
                            <ReactMarkdown>{msg.message}</ReactMarkdown>
                        </div>
                        <p className="message-author">— {msg.author}</p>
                    </div>
                ))
            )}
        </div>
    );
}

export default Dashboard;
