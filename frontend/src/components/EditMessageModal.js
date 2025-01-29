import React, { useState, useEffect } from "react";
import RichTextEditor from "../components/RichTextEditor";
import "../styles/AddMessage.css"; // U¿ywamy tych samych stylów

function EditMessageModal({ isOpen, currentMessage, onSave, onClose }) {
    const [newMessage, setNewMessage] = useState("");
    const MAX_CHAR_LIMIT = 200;

    useEffect(() => {
        if (currentMessage) {
            setNewMessage(currentMessage);
        }
    }, [currentMessage]);

    const handleSave = (e) => {
        e.preventDefault();

        if (!newMessage.trim()) {
            alert("Please write a message.");
            return;
        }

        if (newMessage.length > MAX_CHAR_LIMIT) {
            alert(`Message cannot exceed ${MAX_CHAR_LIMIT} characters.`);
            return;
        }

        onSave(newMessage);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSave} className="add-message-form">
                    <div>
                        <label>Update post:</label>
                        <RichTextEditor
                            value={newMessage}
                            onChange={setNewMessage}
                            maxCharLimit={MAX_CHAR_LIMIT}
                        />

                        <div
                            className={`char-counter ${newMessage.length > MAX_CHAR_LIMIT ? "text-red" : ""}`}
                        >
                            {newMessage.length}/{MAX_CHAR_LIMIT}
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="save-button">
                            Save
                        </button>
                        <button onClick={onClose} type="button" className="cancel-button">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditMessageModal;
