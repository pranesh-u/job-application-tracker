"use client";

import { FileText, Download, Layers, TrendingUp, MoreVertical, Trash2, Edit2, Eye } from "lucide-react";
import { Resume } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface ResumeCardProps {
  resume: Resume;
  onClick: (resume: Resume) => void;
  onDelete: (id: string) => void;
}

export default function ResumeCard({ resume, onClick, onDelete }: ResumeCardProps) {
  const activeVersion = resume.activeVersion;
  const versionCount = resume.versions?.length || 1;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      onClick={() => onClick(resume)}
      className="group relative flex flex-col justify-between p-4 rounded-lg cursor-pointer transition-colors hover:bg-[var(--color-bg-elevated)]"
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border-secondary)",
      }}
    >
      {/* Top Section */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
              style={{ background: "rgba(99, 102, 241, 0.1)" }}
            >
              <FileText className="w-4 h-4 text-[var(--color-accent-primary)]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-white truncate group-hover:text-[var(--color-accent-primary)] transition-colors">
                {resume.name}
              </h3>
              <p className="text-xs text-[var(--color-text-tertiary)] truncate">
                {activeVersion ? activeVersion.fileName : "No version"}
              </p>
            </div>
          </div>

          {/* Category Badge */}
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded shrink-0"
            style={{
              background: "var(--color-bg-tertiary)",
              border: "1px solid var(--color-border-secondary)",
              color: "var(--color-text-secondary)",
            }}
          >
            {resume.type}
          </span>
        </div>

        {/* Versions Tag & Metrics */}
        <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: "var(--color-text-secondary)" }}>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)]">
            <Layers className="w-3 h-3 text-[var(--color-accent-primary)]" />
            <span>
              v{activeVersion?.versionNumber || 1}
              {versionCount > 1 && ` (${versionCount} versions)`}
            </span>
          </div>

          <span className="text-[var(--color-text-muted)]">•</span>

          <span className="text-[11px]">{formatFileSize(activeVersion?.fileSize)}</span>
        </div>
      </div>

      {/* Bottom Section: Performance Metrics & Actions */}
      <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--color-border-secondary)" }}>
        <div className="flex items-center gap-3 text-xs">
          <div>
            <span style={{ color: "var(--color-text-tertiary)" }}>Used in </span>
            <span className="font-semibold text-white">{resume.usageCount}</span>
            <span style={{ color: "var(--color-text-tertiary)" }}> apps</span>
          </div>

          {resume.usageCount > 0 && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-[var(--color-status-success)]" />
              <span className="font-semibold text-[var(--color-status-success)]">
                {resume.interviewRate}%
              </span>
              <span className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>
                interviews
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {activeVersion && (
            <a
              href={`/api/resumes/download/${activeVersion.id}?download=true`}
              className="p-1.5 rounded transition-colors hover:bg-[var(--color-bg-hover)]"
              title="Download file"
            >
              <Download className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
            </a>
          )}
          <button
            onClick={() => onDelete(resume.id)}
            className="p-1.5 rounded transition-colors hover:bg-red-500/10 cursor-pointer"
            title="Delete resume"
          >
            <Trash2 className="w-3.5 h-3.5 text-[var(--color-status-error)]" />
          </button>
        </div>
      </div>
    </div>
  );
}
