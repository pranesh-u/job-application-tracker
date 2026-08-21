"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Plus, Search, Filter, Loader2, Upload } from "lucide-react";
import { Resume, RESUME_TYPES } from "@/types";
import { toast } from "sonner";
import ResumeCard from "@/components/features/resumes/ResumeCard";
import UploadResumeModal from "@/components/features/resumes/UploadResumeModal";
import ResumeDetailModal from "@/components/features/resumes/ResumeDetailModal";

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await fetch("/api/resumes");
      if (!res.ok) throw new Error("Failed to fetch resumes");
      const data = await res.json();
      setResumes(data);
    } catch {
      toast.error("Failed to load resumes");
    } fontally: {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleDeleteResume = async (id: string) => {
    const resumeToDelete = resumes.find((r) => r.id === id);
    setResumes((prev) => prev.filter((r) => r.id !== id));

    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Resume deleted", {
        description: resumeToDelete?.name,
      });
    } catch {
      toast.error("Failed to delete resume");
      fetchResumes();
    }
  };

  const filteredResumes = resumes.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.activeVersion?.fileName || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All" || r.type === selectedType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent-primary)]" />
          <p className="text-sm text-[var(--color-text-secondary)]">Loading your resumes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg font-semibold text-white">Resume Manager</h1>
          <p className="text-sm mt-0.5 text-[var(--color-text-secondary)]">
            Manage, version, and analyze multiple resume variations for different roles
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium text-white transition-colors hover:opacity-90 cursor-pointer shrink-0"
          style={{ background: "var(--color-accent-primary)" }}
        >
          <Plus className="w-4 h-4" />
          <span>Upload Resume</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            placeholder="Search resumes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-md text-sm text-white placeholder-[var(--color-text-muted)] outline-none transition-colors focus:ring-1 focus:ring-[var(--color-accent-primary)]"
            style={{
              background: "var(--color-bg-tertiary)",
              border: "1px solid var(--color-border-secondary)",
            }}
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedType("All")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              selectedType === "All"
                ? "bg-[var(--color-accent-primary)] text-white"
                : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-white border border-[var(--color-border-secondary)]"
            }`}
          >
            All ({resumes.length})
          </button>
          {RESUME_TYPES.map((t) => {
            const count = resumes.filter((r) => r.type === t).length;
            if (count === 0 && selectedType !== t) return null;
            return (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedType === t
                    ? "bg-[var(--color-accent-primary)] text-white"
                    : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-white border border-[var(--color-border-secondary)]"
                }`}
              >
                {t} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Resumes Grid */}
      {filteredResumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onClick={setSelectedResume}
              onDelete={handleDeleteResume}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          className="flex flex-col items-center justify-center py-16 rounded-lg text-center"
          style={{
            background: "var(--color-bg-secondary)",
            border: "1px solid var(--color-border-secondary)",
          }}
        >
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center mb-3"
            style={{ background: "rgba(99, 102, 241, 0.08)" }}
          >
            <Upload className="w-5 h-5 text-[var(--color-accent-primary)]" />
          </div>
          <h3 className="text-sm font-medium text-white mb-1">
            {searchQuery || selectedType !== "All" ? "No resumes match your filter" : "No resumes uploaded yet"}
          </h3>
          <p className="text-xs max-w-xs text-[var(--color-text-secondary)] mb-4">
            Upload your resume files to manage version variations and track application success rates.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium text-white transition-colors hover:opacity-90 cursor-pointer"
            style={{ background: "var(--color-accent-primary)" }}
          >
            <Plus className="w-3.5 h-3.5" />
            Upload First Resume
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadResumeModal
          onClose={() => setShowUploadModal(false)}
          onUploaded={(newResume) => {
            setResumes((prev) => [newResume, ...prev]);
            setShowUploadModal(false);
            toast.success("Resume uploaded successfully!");
          }}
        />
      )}

      {/* Resume Detail Drawer */}
      {selectedResume && (
        <ResumeDetailModal
          resume={selectedResume}
          onClose={() => setSelectedResume(null)}
          onUpdate={fetchResumes}
        />
      )}
    </div>
  );
}
