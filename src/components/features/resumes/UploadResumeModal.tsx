"use client";

import { useState, useRef } from "react";
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { RESUME_TYPES, Resume } from "@/types";

interface UploadResumeModalProps {
  onClose: () => void;
  onUploaded: (resume: Resume) => void;
}

export default function UploadResumeModal({ onClose, onUploaded }: UploadResumeModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("General");
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setError("");
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "txt"].includes(ext || "")) {
      setError("Invalid format. Please select a PDF, DOCX, or TXT file.");
      return;
    }

    setFile(selectedFile);
    if (!name) {
      // Clean extension from default title
      const titleWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf(".")) || selectedFile.name;
      setName(titleWithoutExt);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name || file.name);
      formData.append("type", type);

      const res = await fetch("/api/resumes", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to upload resume");
      }

      const newResume = await res.json();
      onUploaded(newResume);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-lg overflow-hidden flex flex-col"
        style={{
          background: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border-secondary)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 shrink-0"
          style={{ borderBottom: "1px solid var(--color-border-secondary)" }}
        >
          <h2 className="text-base font-semibold text-white">Upload Resume</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md transition-colors hover:bg-[var(--color-bg-hover)] cursor-pointer"
          >
            <X className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* File Dropzone */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center p-6 rounded-lg cursor-pointer border-2 border-dashed transition-colors ${
                dragOver ? "border-[var(--color-accent-primary)] bg-[var(--color-bg-tertiary)]" : "border-[var(--color-border-secondary)] hover:border-[var(--color-text-tertiary)]"
              }`}
              style={{ background: dragOver ? "var(--color-bg-tertiary)" : "var(--color-bg-card)" }}
            >
              {file ? (
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-[var(--color-accent-primary)] shrink-0" />
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium text-white truncate max-w-[240px]">{file.name}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-[var(--color-status-success)] ml-2 shrink-0" />
                </div>
              ) : (
                <>
                  <Upload className="w-7 h-7 text-[var(--color-text-tertiary)] mb-2" />
                  <p className="text-sm font-medium text-white mb-1">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    PDF, DOCX, or TXT (Max 5MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Resume Name */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              Resume Title *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Senior Frontend Resume"
              required
              className="w-full px-3 py-2 rounded-md text-sm text-white placeholder-[var(--color-text-muted)] outline-none transition-colors focus:ring-1 focus:ring-[var(--color-accent-primary)]"
              style={{
                background: "var(--color-bg-tertiary)",
                border: "1px solid var(--color-border-secondary)",
              }}
            />
          </div>

          {/* Category / Type */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              Category / Target Role
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 rounded-md text-sm text-white outline-none cursor-pointer"
              style={{
                background: "var(--color-bg-tertiary)",
                border: "1px solid var(--color-border-secondary)",
              }}
            >
              {RESUME_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-md text-xs"
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.15)",
                color: "var(--color-status-error)",
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Buttons */}
          <div
            className="flex items-center justify-end gap-2 pt-3 shrink-0"
            style={{ borderTop: "1px solid var(--color-border-secondary)" }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-[var(--color-bg-hover)] cursor-pointer"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-40 cursor-pointer"
              style={{ background: "var(--color-accent-primary)" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload Resume"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
