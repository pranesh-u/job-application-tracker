import { useState, useEffect, useCallback } from "react";
import { X, Building2, Briefcase, MapPin, ExternalLink, Calendar, DollarSign, Loader2, FileText, Download } from "lucide-react";
import { Application, KANBAN_STAGES, PRIORITY_CONFIG, Resume } from "@/types";
import { toast } from "sonner";
import ActivityTimeline from "./ActivityTimeline";
import AIMatchCard from "./AIMatchCard";
import { Sparkles } from "lucide-react";

interface ApplicationDetailPanelProps {
  applicationId: string;
  onClose: () => void;
  onUpdate: (app: Application) => void;
}

export default function ApplicationDetailPanel({
  applicationId,
  onClose,
  onUpdate,
}: ApplicationDetailPanelProps) {
  const [app, setApp] = useState<Application | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "ai_match" | "timeline">("details");

  const fetchDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/applications/${applicationId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setApp(data);
    } catch {
      toast.error("Failed to load details");
      onClose();
    } finally {
      setLoading(false);
    }
  }, [applicationId, onClose]);

  useEffect(() => {
    fetchDetails();
    fetch("/api/resumes")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setResumes(data))
      .catch(() => {});
  }, [fetchDetails]);

  const handleUpdateField = async (field: keyof Application, value: any) => {
    if (!app) return;
    
    // Optimistic update
    const updatedApp = { ...app, [field]: value };
    setApp(updatedApp);
    onUpdate(updatedApp);

    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error("Failed to update");
      // Refetch to get updated timeline events if stage/priority changed
      if (field === "stage" || field === "priority") {
        fetchDetails();
      }
    } catch {
      toast.error("Failed to save changes");
      // Revert on error
      fetchDetails();
    }
  };

  if (loading || !app) {
    return (
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[var(--color-bg-secondary)] border-l border-[var(--color-border-secondary)] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent-primary)]" />
      </div>
    );
  }

  const priorityConfig = PRIORITY_CONFIG[app.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.Medium;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col bg-[var(--color-bg-secondary)] border-l border-[var(--color-border-secondary)]">
        {/* Header */}
        <div className="p-5 shrink-0" style={{ borderBottom: "1px solid var(--color-border-secondary)", background: "var(--color-bg-tertiary)" }}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="text-lg font-semibold text-white leading-tight">{app.company}</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{app.role}</p>
            </div>
            <div className="flex items-center gap-1">
              {app.jobUrl && (
                <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md transition-colors hover:bg-[var(--color-bg-hover)]">
                  <ExternalLink className="w-4 h-4 text-[var(--color-text-secondary)]" />
                </a>
              )}
              <button onClick={onClose} className="p-1.5 rounded-md transition-colors hover:bg-[var(--color-bg-hover)] cursor-pointer">
                <X className="w-4 h-4 text-[var(--color-text-secondary)]" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={app.stage}
              onChange={(e) => handleUpdateField("stage", e.target.value)}
              className="px-2.5 py-1 rounded-md text-sm font-medium cursor-pointer outline-none"
              style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-secondary)", color: "white" }}
            >
              {KANBAN_STAGES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>

            <select
              value={app.priority}
              onChange={(e) => handleUpdateField("priority", e.target.value)}
              className="px-2.5 py-1 rounded-md text-sm font-semibold cursor-pointer outline-none"
              style={{
                background: `${priorityConfig.color}12`,
                border: `1px solid ${priorityConfig.color}25`,
                color: priorityConfig.color
              }}
            >
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 px-5 pt-1 overflow-x-auto" style={{ borderBottom: "1px solid var(--color-border-secondary)" }}>
          <button
            onClick={() => setActiveTab("details")}
            className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === "details" ? "border-[var(--color-accent-primary)] text-white" : "border-transparent text-[var(--color-text-secondary)] hover:text-white"
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("ai_match")}
            className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "ai_match" ? "border-[var(--color-accent-primary)] text-white" : "border-transparent text-[var(--color-text-secondary)] hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
            <span>AI Match & JD</span>
            {app.resumeMatch !== null && app.resumeMatch !== undefined && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] font-semibold">
                {app.resumeMatch}%
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === "timeline" ? "border-[var(--color-accent-primary)] text-white" : "border-transparent text-[var(--color-text-secondary)] hover:text-white"
            }`}
          >
            Activity Timeline
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "details" ? (
            <div className="h-full overflow-y-auto p-5 space-y-5">
              
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">General</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">Location</label>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border-secondary)]">
                      <MapPin className="w-3.5 h-3.5 text-[var(--color-text-secondary)] shrink-0" />
                      <input
                        type="text"
                        value={app.location || ""}
                        onChange={(e) => setApp({ ...app, location: e.target.value })}
                        onBlur={(e) => handleUpdateField("location", e.target.value)}
                        placeholder="Remote, City..."
                        className="bg-transparent border-none outline-none text-sm text-white w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">Job URL</label>
                    <input
                        type="url"
                        value={app.jobUrl || ""}
                        onChange={(e) => setApp({ ...app, jobUrl: e.target.value })}
                        onBlur={(e) => handleUpdateField("jobUrl", e.target.value)}
                        placeholder="https://..."
                        className="px-2.5 py-1.5 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border-secondary)] outline-none text-sm text-white w-full"
                      />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-xs text-[var(--color-text-tertiary)] mb-1 flex items-center justify-between">
                    <span>Attached Resume</span>
                    {app.resumeVersionId && (
                      <a
                        href={`/api/resumes/download/${app.resumeVersionId}?download=true`}
                        className="text-[11px] text-[var(--color-accent-primary)] hover:underline flex items-center gap-1 font-medium"
                      >
                        <Download className="w-3 h-3" /> Download
                      </a>
                    )}
                  </label>
                  <select
                    value={app.resumeVersionId || ""}
                    onChange={(e) => handleUpdateField("resumeVersionId", e.target.value || null)}
                    className="w-full px-2.5 py-1.5 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border-secondary)] outline-none text-sm text-white cursor-pointer"
                  >
                    <option value="">None (Unlinked)</option>
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
              </div>

              {/* Job Description Field */}
              <div className="space-y-2 pt-4 border-t border-[var(--color-border-secondary)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Job Description</h3>
                  <button
                    onClick={() => setActiveTab("ai_match")}
                    className="text-[11px] text-[var(--color-accent-primary)] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Analyze in AI Tab
                  </button>
                </div>
                <textarea
                  value={app.jobDescription || ""}
                  onChange={(e) => setApp({ ...app, jobDescription: e.target.value })}
                  onBlur={(e) => handleUpdateField("jobDescription", e.target.value)}
                  placeholder="Paste target Job Description here for AI skill gap & match analysis..."
                  rows={5}
                  className="w-full px-2.5 py-2 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border-secondary)] outline-none text-xs text-white placeholder-[var(--color-text-muted)] focus:ring-1 focus:ring-[var(--color-accent-primary)] resize-none"
                />
              </div>

              <div className="space-y-3 pt-4 border-t border-[var(--color-border-secondary)]">
                <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Dates</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">Applied On</label>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border-secondary)]">
                      <Calendar className="w-3.5 h-3.5 text-[var(--color-text-secondary)] shrink-0" />
                      <input
                        type="date"
                        value={app.applicationDate ? new Date(app.applicationDate).toISOString().split('T')[0] : ""}
                        onChange={(e) => setApp({ ...app, applicationDate: e.target.value })}
                        onBlur={(e) => handleUpdateField("applicationDate", e.target.value || null)}
                        className="bg-transparent border-none outline-none text-sm text-white w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">Deadline</label>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border-secondary)]">
                      <Calendar className="w-3.5 h-3.5 text-[var(--color-text-secondary)] shrink-0" />
                      <input
                        type="date"
                        value={app.deadline ? new Date(app.deadline).toISOString().split('T')[0] : ""}
                        onChange={(e) => setApp({ ...app, deadline: e.target.value })}
                        onBlur={(e) => handleUpdateField("deadline", e.target.value || null)}
                        className="bg-transparent border-none outline-none text-sm text-white w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[var(--color-border-secondary)]">
                <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Compensation</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">Min Salary</label>
                    <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border-secondary)]">
                      <DollarSign className="w-3.5 h-3.5 text-[var(--color-text-secondary)] shrink-0" />
                      <input
                        type="number"
                        value={app.salaryMin || ""}
                        onChange={(e) => setApp({ ...app, salaryMin: Number(e.target.value) || null })}
                        onBlur={(e) => handleUpdateField("salaryMin", Number(e.target.value) || null)}
                        className="bg-transparent border-none outline-none text-sm text-white w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">Max Salary</label>
                    <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border-secondary)]">
                      <DollarSign className="w-3.5 h-3.5 text-[var(--color-text-secondary)] shrink-0" />
                      <input
                        type="number"
                        value={app.salaryMax || ""}
                        onChange={(e) => setApp({ ...app, salaryMax: Number(e.target.value) || null })}
                        onBlur={(e) => handleUpdateField("salaryMax", Number(e.target.value) || null)}
                        className="bg-transparent border-none outline-none text-sm text-white w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[var(--color-border-secondary)]">
                <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Notes</h3>
                <textarea
                  value={app.notes || ""}
                  onChange={(e) => setApp({ ...app, notes: e.target.value })}
                  onBlur={(e) => handleUpdateField("notes", e.target.value)}
                  placeholder="General notes about this application..."
                  rows={4}
                  className="w-full px-2.5 py-2 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border-secondary)] outline-none text-sm text-white placeholder-[var(--color-text-muted)] focus:ring-1 focus:ring-[var(--color-accent-primary)] resize-none"
                />
              </div>

            </div>
          ) : activeTab === "ai_match" ? (
            <div className="h-full overflow-y-auto p-5 space-y-5">
              {/* Job Description Editor inside AI tab */}
              <div className="space-y-2 pb-4 border-b border-[var(--color-border-secondary)]">
                <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Target Job Description
                </h3>
                <textarea
                  value={app.jobDescription || ""}
                  onChange={(e) => setApp({ ...app, jobDescription: e.target.value })}
                  onBlur={(e) => handleUpdateField("jobDescription", e.target.value)}
                  placeholder="Paste target Job Description requirements here..."
                  rows={4}
                  className="w-full px-2.5 py-2 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border-secondary)] outline-none text-xs text-white placeholder-[var(--color-text-muted)] focus:ring-1 focus:ring-[var(--color-accent-primary)] resize-none"
                />
              </div>

              <AIMatchCard
                application={app}
                onAnalysisComplete={(updatedApp) => {
                  setApp(updatedApp);
                  onUpdate(updatedApp);
                  fetchDetails();
                }}
              />
            </div>
          ) : (
            <ActivityTimeline
              applicationId={applicationId}
              events={app.timelineEvents || []}
              onEventAdded={(event) => {
                setApp({
                  ...app,
                  timelineEvents: [event, ...(app.timelineEvents || [])]
                });
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
