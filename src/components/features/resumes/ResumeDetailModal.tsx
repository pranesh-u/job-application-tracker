"use client";

import { useState, useRef } from "react";
import { X, FileText, Download, Upload, Layers, Briefcase, Eye, Code, Loader2 } from "lucide-react";
import { Resume, ResumeVersion } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface ResumeDetailModalProps {
  resume: Resume;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ResumeDetailModal({
  resume,
  onClose,
  onUpdate,
}: ResumeDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "history" | "text" | "applications">("preview");
  const [selectedVersion, setSelectedVersion] = useState<ResumeVersion>(
    resume.activeVersion || resume.versions?.[0] || ({} as ResumeVersion)
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const versionInputRef = useRef<HTMLInputElement>(null);

  const handleVersionUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/resumes/${resume.id}/versions`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to upload version");
      }

      const newVersion = await res.json();
      setSelectedVersion(newVersion);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload version");
    } finally {
      setUploading(false);
    }
  };

  const isPdf = selectedVersion.fileName?.toLowerCase().endsWith(".pdf");

  return (
    <>
      {/* Background Overlay */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl flex flex-col bg-[var(--color-bg-secondary)] border-l border-[var(--color-border-secondary)]">
        {/* Header */}
        <div
          className="p-5 shrink-0"
          style={{
            borderBottom: "1px solid var(--color-border-secondary)",
            background: "var(--color-bg-tertiary)",
          }}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                style={{ background: "rgba(99, 102, 241, 0.1)" }}
              >
                <FileText className="w-5 h-5 text-[var(--color-accent-primary)]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white leading-tight">{resume.name}</h2>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  Category: <span className="text-white font-medium">{resume.type}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={versionInputRef}
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleVersionUpload(e.target.files[0]);
                  }
                }}
              />
              <button
                onClick={() => versionInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white transition-colors hover:opacity-90 cursor-pointer"
                style={{ background: "var(--color-accent-primary)" }}
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Upload New Version
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-md transition-colors hover:bg-[var(--color-bg-hover)] cursor-pointer"
              >
                <X className="w-4 h-4 text-[var(--color-text-secondary)]" />
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-[var(--color-status-error)] mt-2">{error}</p>
          )}

          {/* Active Version Selector Header Pill */}
          <div className="flex items-center gap-3 mt-3 text-xs">
            <span className="text-[var(--color-text-tertiary)]">Viewing:</span>
            <select
              value={selectedVersion.id}
              onChange={(e) => {
                const found = resume.versions?.find((v) => v.id === e.target.value);
                if (found) setSelectedVersion(found);
              }}
              className="px-2 py-1 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border-secondary)] text-white text-xs font-medium cursor-pointer outline-none"
            >
              {resume.versions?.map((v) => (
                <option key={v.id} value={v.id}>
                  v{v.versionNumber} ({v.fileName}) {v.isActive ? "— [Active]" : ""}
                </option>
              ))}
            </select>

            <a
              href={`/api/resumes/download/${selectedVersion.id}?download=true`}
              className="flex items-center gap-1 text-[var(--color-accent-primary)] hover:underline ml-auto font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
          </div>
        </div>

        {/* Tabs Bar */}
        <div
          className="flex shrink-0 px-5 pt-1"
          style={{ borderBottom: "1px solid var(--color-border-secondary)" }}
        >
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
              activeTab === "preview"
                ? "border-[var(--color-accent-primary)] text-white"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
              activeTab === "history"
                ? "border-[var(--color-accent-primary)] text-white"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Versions ({resume.versions?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("text")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
              activeTab === "text"
                ? "border-[var(--color-accent-primary)] text-white"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-white"
            }`}
          >
            <Code className="w-3.5 h-3.5" /> Extracted Text
          </button>

          <button
            onClick={() => setActiveTab("applications")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
              activeTab === "applications"
                ? "border-[var(--color-accent-primary)] text-white"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-white"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Linked Apps ({resume.usageCount || 0})
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "preview" && (
            <div className="h-full flex flex-col p-4">
              {isPdf ? (
                <iframe
                  src={`/api/resumes/download/${selectedVersion.id}`}
                  className="w-full h-full rounded-md border border-[var(--color-border-secondary)] bg-white"
                  title="PDF Preview"
                />
              ) : (
                <div className="h-full overflow-y-auto p-4 rounded-md bg-[var(--color-bg-card)] border border-[var(--color-border-secondary)]">
                  <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] mb-2 uppercase">
                    Text Document Content
                  </h4>
                  <pre className="text-xs text-white whitespace-pre-wrap font-sans">
                    {selectedVersion.rawText || "No text available for preview."}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="h-full overflow-y-auto p-5 space-y-3">
              <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">
                Version Timeline
              </h4>

              {resume.versions?.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setSelectedVersion(v)}
                  className={`p-3 rounded-md border transition-colors cursor-pointer ${
                    selectedVersion.id === v.id
                      ? "border-[var(--color-accent-primary)] bg-[var(--color-bg-tertiary)]"
                      : "border-[var(--color-border-secondary)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-elevated)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white px-2 py-0.5 rounded bg-[var(--color-bg-elevated)]">
                        v{v.versionNumber}
                      </span>
                      <span className="text-sm font-medium text-white">{v.fileName}</span>
                      {v.isActive && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active Default
                        </span>
                      )}
                    </div>

                    <a
                      href={`/api/resumes/download/${v.id}?download=true`}
                      className="p-1 rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-[var(--color-text-tertiary)]">
                    <span>Uploaded {formatDistanceToNow(new Date(v.uploadedAt), { addSuffix: true })}</span>
                    <span>•</span>
                    <span>{(v.fileSize / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "text" && (
            <div className="h-full overflow-y-auto p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  Raw Extracted Text (AI Matching Engine Input)
                </h4>
                {!selectedVersion.rawText && (
                  <button
                    onClick={async () => {
                      setError("");
                      try {
                        const res = await fetch(`/api/resumes/${resume.id}/extract`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ versionId: selectedVersion.id }),
                        });
                        if (res.ok) {
                          const data = await res.json();
                          if (data.rawText) {
                            setSelectedVersion({ ...selectedVersion, rawText: data.rawText });
                          }
                          onUpdate();
                        } else {
                          const data = await res.json();
                          setError(data.error || "Failed to extract text");
                        }
                      } catch {
                        setError("Failed to extract text from this file.");
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white transition-colors hover:opacity-90 cursor-pointer"
                    style={{ background: "var(--color-accent-primary)" }}
                  >
                    <Code className="w-3.5 h-3.5" /> Re-Extract Text
                  </button>
                )}
              </div>

              <div className="p-4 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border-secondary)] font-mono text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap leading-relaxed">
                {selectedVersion.rawText ? (
                  selectedVersion.rawText
                ) : (
                  <span className="text-[var(--color-text-muted)] italic">
                    No text extracted yet. Click &quot;Re-Extract Text&quot; above to parse the uploaded file.
                  </span>
                )}
              </div>
            </div>
          )}

          {activeTab === "applications" && (
            <div className="h-full overflow-y-auto p-5">
              <h4 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">
                Applications Linked to Version v{selectedVersion.versionNumber}
              </h4>

              {selectedVersion.applications && selectedVersion.applications.length > 0 ? (
                <div className="space-y-2">
                  {selectedVersion.applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-3 rounded-md bg-[var(--color-bg-card)] border border-[var(--color-border-secondary)] flex items-center justify-between"
                    >
                      <div>
                        <h5 className="text-sm font-medium text-white">{app.company}</h5>
                        <p className="text-xs text-[var(--color-text-secondary)]">{app.role}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]">
                        {app.stage}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--color-text-tertiary)] italic py-4">
                  No applications are currently linked to version v{selectedVersion.versionNumber}.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
