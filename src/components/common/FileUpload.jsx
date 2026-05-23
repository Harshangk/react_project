import { useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";

export default function FileUpload({
    onFileSelect,
    file,
    error,
    progress = 0,
    uploading = false,
}) {
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);

        const selectedFile = event.dataTransfer.files?.[0];
        if (selectedFile) onFileSelect(selectedFile);
    };

    const handleChange = (event) => {
        const selectedFile = event.target.files?.[0];
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
            <div
                className={`file-upload-box ${isDragging ? "drag-active" : ""}`}
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        inputRef.current?.click();
                    }
                }}
            >
                <UploadCloud size={46} className="upload-svg" />

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

            {file && (
                <div className="file-card">
                    <div className="file-left">
                        <FileText size={18} />
                    </div>

                    <div className="file-center">
                        <div className="file-name">{file.name}</div>
                        <div className="file-size">{formatSize(file.size)}</div>
                    </div>

                    <button
                        type="button"
                        className="file-remove"
                        onClick={() => onFileSelect(null)}
                        aria-label="Remove selected file"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {uploading && (
                <div className="progress-wrapper">
                    <div
                        className="progress-bar"
                        style={{ width: `${progress}%` }}
                    />
                    <span className="progress-text">{progress}%</span>
                </div>
            )}

            {error && <p className="error-text">{error}</p>}
        </div>
    );
}
