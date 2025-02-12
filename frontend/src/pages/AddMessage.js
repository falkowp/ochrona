import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RichTextEditor from "../components/RichTextEditor";
import "../styles/AddMessage.css";
import "../styles/App.css";

function AddMessage() {
    const [newMessage, setNewMessage] = useState("");
    const [author, setAuthor] = useState("");
    const navigate = useNavigate();
    const MAX_CHAR_LIMIT = 400;

    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            navigate("/login");
        } else {
            setAuthor("User");
        }
    }, [navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!newMessage.trim()) {
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

                    <RichTextEditor
                        value={newMessage}
                        onChange={setNewMessage}
                        maxCharLimit={MAX_CHAR_LIMIT}
                    />

                    <div
                        className={`char-counter ${newMessage.length > MAX_CHAR_LIMIT ? "text-red" : ""
                            }`}
                    >
                        {newMessage.length}/{MAX_CHAR_LIMIT}
                    </div>
                </div>
                <button type="submit">Add Message</button>
            </form>
        </div>
    );
}

export default AddMessage;
