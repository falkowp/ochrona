import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

function Dashboard() {
    const [messages, setMessages] = useState([]);
    const [username, setUsername] = useState("");
    const navigate = useNavigate();
    const token = localStorage.getItem("jwtToken");

    // Pobranie nazwy u¿ytkownika z tokena JWT
    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1])); // Rozdzielamy token na czêœci i dekodujemy Base64
            setUsername(payload.username);
        } catch (error) {
            console.error("Invalid token:", error);
            navigate("/login");
        }
    }, [navigate, token]);

    // Pobranie wiadomoœci z API
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

    // Wylogowanie u¿ytkownika
    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        navigate("/login");
    };

    // Edycja wiadomoœci
    const editMessage = (id, newMessage) => {
        fetch(`/api/messages/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message: newMessage }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to edit the message.");
                }
                return response.json();
            })
            .then(() => {
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg.id === id ? { ...msg, message: newMessage } : msg
                    )
                );
            })
            .catch((error) => console.error(error));
    };

    // Usuniêcie wiadomoœci
    const deleteMessage = (id) => {
        fetch(`/api/messages/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to delete the message.");
                }
                return response.json();
            })
            .then(() => {
                setMessages((prevMessages) =>
                    prevMessages.filter((msg) => msg.id !== id)
                );
            })
            .catch((error) => console.error(error));
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
                        <p className="message-date">Posted on: {msg.created_at}</p>
                        <div className="message-text">
                            <ReactMarkdown>{msg.message}</ReactMarkdown>
                        </div>
                        <p className="message-author">
                            ~{msg.author} {msg.author === username && "(you)"}
                        </p>
                        {msg.author === username && (
                            <div className="message-actions">
                                <button
                                    className="edit-button"
                                    onClick={() => {
                                        const newMessage = prompt("Edit your message:", msg.message);
                                        if (newMessage) {
                                            editMessage(msg.id, newMessage);
                                        }
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    className="delete-button"
                                    onClick={() => deleteMessage(msg.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default Dashboard;
