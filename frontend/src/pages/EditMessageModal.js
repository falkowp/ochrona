import React, { useState, useEffect } from "react";

function EditMessageModal({ isOpen, currentMessage, onSave, onClose }) {
    const [newMessage, setNewMessage] = useState("");

    // Synchronizuj treœæ wiadomoœci w polu tekstowym z aktualnie edytowan¹ wiadomoœci¹
    useEffect(() => {
        if (currentMessage) {
            setNewMessage(currentMessage);
        }
    }, [currentMessage]);

    const handleSave = () => {
        onSave(newMessage); // Wywo³anie callbacku z now¹ treœci¹
        onClose(); // Zamkniêcie modala
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Edit Message</h2>
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows="4"
                />
                <div className="modal-actions">
                    <button onClick={handleSave} className="save-button">
                        Save
                    </button>
                    <button onClick={onClose} className="cancel-button">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditMessageModal;
