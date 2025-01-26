import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import '../styles/Dashboard.css'; // Importujemy plik CSS

function Dashboard() {
    const [messages, setMessages] = useState([]);

    // Fetch messages from the backend
    useEffect(() => {
        fetch("/api/messages")
            .then((response) => response.json())
            .then((data) => setMessages(data.messages))
            .catch((error) => console.error("Error fetching messages:", error));
    }, []);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Welcome to Your Dashboard</h1>
                <Link to="/addmsg" className="add-message-button">
                    Add a New Message
                </Link>
            </div>

            {/* Messages */}
            {messages.length === 0 ? (
                <p className="no-messages">No messages to display.</p>
            ) : (
                <div>
                    {messages.map((msg) => (
                        <div key={msg.id} className="message-container">
                            <ReactMarkdown className="message-text">
                                {msg.message}
                            </ReactMarkdown>
                            <p className="message-author">— {msg.author}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dashboard;
