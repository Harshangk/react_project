import { useRef, useState } from "react";

export default function FileUpload({
    onFileSelect,
    file,
    error,
    progress = 0,
    uploading = false,
}) {
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const selectedFile = e.dataTransfer.files?.[0];
        if (selectedFile) onFileSelect(selectedFile);
    };

    const handleChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) onFileSelect(selectedFile);
    };

    const formatSize = (size) => {
        if (!size) return "";
        const mb = size / 1024 / 1024;
        return mb < 1
            ? `${(size / 1024).toFixed(1)} KB`
            : `${mb.toFixed(2)} MB`;
    };

    return (
        <div className="file-upload-wrapper">

            {/* DROP AREA */}
            <div
                className={`file-upload-box ${isDragging ? "drag-active" : ""}`}
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
            >
                {/* ✅ SVG ICON (NO INTERNET REQUIRED) */}
                <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="upload-svg"
                >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" x2="12" y1="3" y2="15" />
                </svg>

                <p className="upload-text">
                    Drop your CSV file here, or <b>browse</b>
                </p>

                <small className="upload-subtext">
                    Supports .csv files only
                </small>

                <input
                    type="file"
                    accept=".csv"
                    ref={inputRef}
                    onChange={handleChange}
                    hidden
                />
            </div>

            {/* ✅ CLEAN FILE INFO (BETTER UI) */}
            {file && (
                <div className="file-card">
                    <div className="file-left">
                        📄
                    </div>

                    <div className="file-center">
                        <div className="file-name">{file.name}</div>
                        <div className="file-size">{formatSize(file.size)}</div>
                    </div>

                    <div
                        className="file-remove"
                        onClick={() => onFileSelect(null)}
                    >
                        ✖
                    </div>
                </div>
            )}

            {/* PROGRESS */}
            {uploading && (
                <div className="progress-wrapper">
                    <div
                        className="progress-bar"
                        style={{ width: `${progress}%` }}
                    />
                    <span className="progress-text">{progress}%</span>
                </div>
            )}

            {/* ERROR */}
            {error && <p className="error-text">{error}</p>}
        </div>
    );
}
