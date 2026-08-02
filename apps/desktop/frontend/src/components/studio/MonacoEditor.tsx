import React, { useState } from "react";

interface MonacoEditorProps {
  code: string;
  onChange: (newCode: string) => void;
}

export function MonacoEditor({ code, onChange }: MonacoEditorProps) {
  const [lineCount, setLineCount] = useState(code.split("\n").length);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);
    setLineCount(val.split("\n").length);
  };

  return (
    <div style={{
      display: "flex",
      background: "#0c0c12",
      border: "1px solid #23232e",
      borderRadius: "4px",
      height: "100%",
      fontFamily: "monospace",
      fontSize: "13px",
      overflow: "hidden"
    }}>
      {/* Line Numbers */}
      <div style={{
        padding: "10px 6px",
        background: "#08080c",
        borderRight: "1px solid #23232e",
        color: "#4a4a5a",
        textAlign: "right",
        userSelect: "none",
        lineHeight: "20px",
        minWidth: "30px"
      }}>
        {Array.from({ length: Math.max(1, lineCount) }).map((_, idx) => (
          <div key={idx}>{idx + 1}</div>
        ))}
      </div>

      {/* Editor Body */}
      <textarea
        value={code}
        onChange={handleTextChange}
        style={{
          flex: 1,
          padding: "10px",
          background: "transparent",
          color: "#4CAF50", // Pine Green look-alike color theme
          border: "none",
          outline: "none",
          resize: "none",
          fontFamily: "monospace",
          fontSize: "13px",
          lineHeight: "20px",
          tabSize: 4
        }}
        placeholder="// Write your custom pine script logic here..."
      />
    </div>
  );
}
