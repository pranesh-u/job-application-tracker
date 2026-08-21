"use client";

import { useState, useEffect } from "react";
import { X, Building2, Briefcase, MapPin, DollarSign, Calendar, Flag, FileText, Loader2 } from "lucide-react";
import { Application, KANBAN_STAGES, PRIORITY_CONFIG, Resume } from "@/types";

interface NewApplicationModalProps {
  onClose: () => void;
  onCreated: (app: Application) => void;
}

export default function NewApplicationModal({
  onClose,
  onCreated,
}: NewApplicationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    location: "",
    jobUrl: "",
    salaryMin: "",
    salaryMax: "",
    applicationDate: "",
    deadline: "",
    priority: "Medium",
    stage: "Wishlist",
    notes: "",
    jobDescription: "",
    recruiterName: "",
    recruiterEmail: "",
    recruiterPhone: "",
    resumeVersionId: "",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetch("/api/resumes")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setResumes(data))
      .catch(() => {});
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
          salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create application");
      }

      const app = await res.json();
      onCreated(app);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-2.5 py-2 rounded-md text-sm text-white placeholder-[var(--color-text-muted)] outline-none transition-colors focus:ring-1 focus:ring-[var(--color-accent-primary)]";
  const inputStyle = {
    background: "var(--color-bg-tertiary)",
    border: "1px solid var(--color-border-secondary)",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-lg overflow-hidden flex flex-col"
        style={{
          background: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border-secondary)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 shrink-0"
          style={{ borderBottom: "1px solid var(--color-border-secondary)" }}>
          <h2 className="text-base font-semibold text-white">New Application</h2>
          <button onClick={onClose} className="p-1 rounded-md transition-colors hover:bg-[var(--color-bg-hover)] cursor-pointer">
            <X className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} />
          </button>
        </div>

        {/* Form */}
        <form id="new-application-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Essential Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Company */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                <Building2 className="w-3.5 h-3.5" /> Company *
              </label>
              <input
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                placeholder="Google"
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>

            {/* Role */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                <Briefcase className="w-3.5 h-3.5" /> Role *
              </label>
              <input
                name="role"
                type="text"
                value={formData.role}
                onChange={handleChange}
                placeholder="Software Engineer"
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                <MapPin className="w-3.5 h-3.5" /> Location
              </label>
              <input
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="San Francisco, CA"
                className={inputClass}
                style={inputStyle}
              />
            </div>

            {/* Job URL */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                <FileText className="w-3.5 h-3.5" /> Job URL
              </label>
              <input
                name="jobUrl"
                type="url"
                value={formData.jobUrl}
                onChange={handleChange}
                placeholder="https://careers.google.com/..."
                className={inputClass}
                style={inputStyle}
              />
            </div>

            {/* Priority */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                <Flag className="w-3.5 h-3.5" /> Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={inputClass + " cursor-pointer"}
                style={inputStyle}
              >
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Stage */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                <Calendar className="w-3.5 h-3.5" /> Initial Stage
              </label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className={inputClass + " cursor-pointer"}
                style={inputStyle}
              >
                {KANBAN_STAGES.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Linked Resume */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                <FileText className="w-3.5 h-3.5" /> Attached Resume
              </label>
              <select
                name="resumeVersionId"
                value={formData.resumeVersionId}
                onChange={handleChange}
                className={inputClass + " cursor-pointer"}
                style={inputStyle}
              >
                <option value="">None (Select later)</option>
                {resumes.map((r) => {
                  const ver = r.activeVersion;
                  if (!ver) return null;
                  return (
                    <option key={ver.id} value={ver.id}>
                      {r.name} — v{ver.versionNumber} ({r.type})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Dates */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                <Calendar className="w-3.5 h-3.5" /> Application Date
              </label>
              <input
                name="applicationDate"
                type="date"
                value={formData.applicationDate}
                onChange={handleChange}
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                <Clock className="w-3.5 h-3.5" /> Deadline
              </label>
              <input
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              <FileText className="w-3.5 h-3.5" /> Job Description
            </label>
            <textarea
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              placeholder="Paste the job description here for AI analysis..."
              rows={4}
              className={inputClass + " resize-none"}
              style={inputStyle}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any notes about this application..."
              rows={2}
              className={inputClass + " resize-none"}
              style={inputStyle}
            />
          </div>

          {/* Advanced Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm font-medium transition-colors cursor-pointer"
            style={{ color: "var(--color-accent-primary)" }}
          >
            {showAdvanced ? "Hide" : "Show"} advanced fields
          </button>

          {/* Advanced Fields */}
          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                  <DollarSign className="w-3.5 h-3.5" /> Salary Min
                </label>
                <input
                  name="salaryMin"
                  type="number"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  placeholder="50000"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                  <DollarSign className="w-3.5 h-3.5" /> Salary Max
                </label>
                <input
                  name="salaryMax"
                  type="number"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  placeholder="80000"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--color-text-secondary)" }}>
                  Recruiter Name
                </label>
                <input
                  name="recruiterName"
                  type="text"
                  value={formData.recruiterName}
                  onChange={handleChange}
                  placeholder="Jane Smith"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--color-text-secondary)" }}>
                  Recruiter Email
                </label>
                <input
                  name="recruiterEmail"
                  type="email"
                  value={formData.recruiterEmail}
                  onChange={handleChange}
                  placeholder="jane@company.com"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="px-3 py-2.5 rounded-md text-sm"
              style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)", color: "var(--color-status-error)" }}>
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 shrink-0"
          style={{ borderTop: "1px solid var(--color-border-secondary)" }}>
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
            form="new-application-form"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-40 cursor-pointer"
            style={{ background: "var(--color-accent-primary)" }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Create Application"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Clock(props: React.SVGAttributes<SVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
