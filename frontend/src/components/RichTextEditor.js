import React, { useRef } from "react";
import { FaBold, FaItalic, FaImage, FaCode, FaListUl, FaListOl, FaQuoteRight } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

function RichTextEditor({ value, onChange, maxCharLimit }) {
    const textareaRef = useRef(null);

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

    const insertLinkOrImage = (type) => {
        const url = prompt(`Enter ${type} URL:`);
        if (url) {
            const syntax = type === "image" ? `![Alt text](${url})` : `[Link text](${url})`;
            const newText = `${value}${syntax}`;
            if (newText.length <= maxCharLimit) {
                onChange(newText);
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
                <button type="button" onClick={() => addFormatting("`")} className="toolbar-button">
                    <FaCode title="Inline Code" />
                </button>
                <button type="button" onClick={() => addFormatting("\n> ", "Quote")} className="toolbar-button">
                    <FaQuoteRight title="Blockquote" />
                </button>
                <button type="button" onClick={() => addFormatting("\n- ", "List item")} className="toolbar-button">
                    <FaListUl title="Unordered List" />
                </button>
                <button type="button" onClick={() => addFormatting("\n1. ", "List item")} className="toolbar-button">
                    <FaListOl title="Ordered List" />
                </button>
                <button type="button" onClick={() => insertLinkOrImage("image")} className="toolbar-button">
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
        </div>
    );
}

export default RichTextEditor;
