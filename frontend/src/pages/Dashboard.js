import React, { useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import EditMessageModal from "../components/EditMessageModal";
import "../styles/App.css";

function Dashboard() {
    const [messages, setMessages] = useState([]);
    const [username, setUsername] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentMessage, setCurrentMessage] = useState(null);
    const [currentMessageId, setCurrentMessageId] = useState(null);

    const navigate = useNavigate();
    const token = localStorage.getItem("jwtToken");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1])); 
            setUsername(payload.username);
        } catch (error) {
            console.error("Invalid token:", error);
            navigate("/login");
        }
    }, [navigate, token]);

    const fetchMessages = useCallback(() => {
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

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]); 

    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        navigate("/login");
    };

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
                    throw new Error("Failed to update the message.");
                }
                return response.json();
            })
            .then(() => {
                fetchMessages(); 
            })
            .catch((error) => console.error("Error updating message:", error));
    };

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
                fetchMessages(); 
            })
            .catch((error) => console.error("Error deleting message:", error));
    };

    const handleEdit = (id, message) => {
        setCurrentMessage(message);
        setCurrentMessageId(id);
        setIsEditModalOpen(true);
    };

    return (
        <div className="dashboard-container">
            <EditMessageModal
                isOpen={isEditModalOpen}
                currentMessage={currentMessage}
                onSave={(newMessage) => {
                    editMessage(currentMessageId, newMessage);
                    setIsEditModalOpen(false); 
                }}
                onClose={() => setIsEditModalOpen(false)}
            />

            <div className="dashboard-header">
                <div className="user-profile">
                    <h1>
                        Hello, <Link to="/profile">{username}</Link>!
                    </h1>
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
                        <p className="message-date">
                            Posted on: {msg.created_at}
                            {msg.updated_at && <span> (Edited on: {msg.updated_at})</span>}
                        </p>
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
                                    onClick={() => handleEdit(msg.id, msg.message)}
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
