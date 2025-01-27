import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddMessage.css";

function AddMessage() {
    const [newMessage, setNewMessage] = useState("");
    const [author, setAuthor] = useState("");
    const navigate = useNavigate();
    const MAX_CHAR_LIMIT = 200;

    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            navigate("/login");
        } else {
            // Mo¿na tutaj wys³aæ zapytanie do serwera, aby uzyskaæ dane u¿ytkownika
            setAuthor("User"); // Ustawianie autora
        }
    }, [navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!newMessage) {
            alert("Please write a message.");
            return;
        }

        if (newMessage.length > MAX_CHAR_LIMIT) {
            alert(`Message cannot exceed ${MAX_CHAR_LIMIT} characters.`);
            return;
        }

        const token = localStorage.getItem("jwtToken");

        fetch("/api/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message: newMessage, author }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message === "Message created successfully!") {
                    navigate("/dashboard");
                } else {
                    alert("Failed to add the message.");
                }
            })
            .catch((error) => console.error("Error adding message:", error));
    };

    return (
        <div className="add-message-container">
            <form onSubmit={handleSubmit} className="add-message-form">
                <div>
                    <label>New post:</label>
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows="4"
                        placeholder="Write your message here..."
                        maxLength={MAX_CHAR_LIMIT + 1}
                    />
                    <div className={`char-counter ${newMessage.length > MAX_CHAR_LIMIT ? "text-red" : ""}`}>
                        {newMessage.length}/{MAX_CHAR_LIMIT}
                    </div>
                </div>
                <button type="submit">Add Message</button>
            </form>
        </div>
    );
}

export default AddMessage;
