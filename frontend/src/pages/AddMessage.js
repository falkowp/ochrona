import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddMessage.css"; // Importujemy plik CSS

function AddMessage() {
    const [newMessage, setNewMessage] = useState("");
    const [author, setAuthor] = useState("");
    const navigate = useNavigate();

    const MAX_CHAR_LIMIT = 200; // Limit znaków dla wiadomoœci

    // Obs³uguje wysy³anie wiadomoœci
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!newMessage || !author) {
            alert("Please fill out both the message and author fields.");
            return;
        }

        if (newMessage.length > MAX_CHAR_LIMIT) {
            alert(`Message cannot exceed ${MAX_CHAR_LIMIT} characters.`);
            return;
        }

        fetch("/api/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
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
                    <label>Message:</label>
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows="4"
                        placeholder="Write your message here..."
                        maxLength={MAX_CHAR_LIMIT + 1} // Opcjonalnie ograniczamy wprowadzanie znaków
                    />
                    {/* Licznik znaków */}
                    <div
                        className={`char-counter ${newMessage.length > MAX_CHAR_LIMIT ? "text-red" : ""
                            }`}
                    >
                        {newMessage.length}/{MAX_CHAR_LIMIT}
                    </div>
                </div>
                <div>
                    <label>Author:</label>
                    <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Your name"
                    />
                </div>
                <button type="submit">Add Message</button>
            </form>
        </div>
    );
}

export default AddMessage;
