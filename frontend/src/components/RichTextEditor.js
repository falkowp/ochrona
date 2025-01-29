import React, { useRef, useState } from "react";
import { FaBold, FaItalic, FaImage } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

function RichTextEditor({ value, onChange, maxCharLimit }) {
    const textareaRef = useRef(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [altText, setAltText] = useState("");

    const addFormatting = (syntax, placeholder = "") => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.slice(start, end);
        const beforeText = value.slice(0, start);
        const afterText = value.slice(end);

        const formattedText = selectedText
            ? `${syntax}${selectedText}${syntax}`
            : `${syntax}${placeholder}${syntax}`;

        const newText = `${beforeText}${formattedText}${afterText}`;
        if (newText.length <= maxCharLimit) {
            onChange(newText);
            textarea.focus();
        }
    };

    const handleInsertImage = () => {
        setModalOpen(true); // Otwórz modal
    };

    const handleImageSubmit = () => {
        if (imageUrl) {
            const syntax = `![${altText || "Alt text"}](${imageUrl})`;
            const newText = `${value}${syntax}`;
            if (newText.length <= maxCharLimit) {
                onChange(newText);
                setModalOpen(false); // Zamknij modal po dodaniu obrazu
            }
        }
    };

    return (
        <div className="editor-container">
            <div className="toolbar">
                <button type="button" onClick={() => addFormatting("**")} className="toolbar-button">
                    <FaBold title="Bold" />
                </button>
                <button type="button" onClick={() => addFormatting("_")} className="toolbar-button">
                    <FaItalic title="Italic" />
                </button>
                <button type="button" onClick={handleInsertImage} className="toolbar-button">
                    <FaImage title="Insert Image" />
                </button>
            </div>

            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => {
                    if (e.target.value.length <= maxCharLimit) onChange(e.target.value);
                }}
                rows="6"
                placeholder="Write your message in Markdown..."
            ></textarea>

            <div className="preview">
                <h4>Preview:</h4>
                <div className="markdown-preview">
                    <ReactMarkdown>{value}</ReactMarkdown>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Insert Image</h3>
                        <label>
                            Image URL:
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                            />
                        </label>
                        <label>
                            Alt Text:
                            <input
                                type="text"
                                value={altText}
                                onChange={(e) => setAltText(e.target.value)}
                                placeholder="Optional alt text"
                            />
                        </label>
                        <button onClick={handleImageSubmit}>Insert Image</button>
                        <button onClick={() => setModalOpen(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RichTextEditor;
