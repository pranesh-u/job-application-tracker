"use client";

import { useState } from "react";
import { Sparkles, CheckCircle2, AlertTriangle, ArrowUpRight, Zap, Target, ShieldCheck, Cpu, RefreshCw, FileText } from "lucide-react";
import { Application } from "@/types";
import { AIAnalysisResult } from "@/lib/aiAnalyzer";
import { toast } from "sonner";

interface AIMatchCardProps {
  application: Application;
  onAnalysisComplete: (updatedApp: Application) => void;
}

export default function AIMatchCard({ application, onAnalysisComplete }: AIMatchCardProps) {
  const [analyzing, setAnalyzing] = useState(false);

  // Parse cached analysis if present
  let initialAnalysis: AIAnalysisResult | null = null;
  if (application.analysisData) {
    try {
      initialAnalysis = JSON.parse(application.analysisData);
    } catch {
      initialAnalysis = null;
    }
  }

  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(initialAnalysis);

  const handleRunAnalysis = async () => {
    if (!application.resumeVersionId) {
      toast.error("Please link a resume version first in the Details tab.");
      return;
    }
    if (!application.jobDescription || application.jobDescription.trim().length === 0) {
      toast.error("Please add a Job Description to run AI analysis.");
      return;
    }

    setAnalyzing(true);
    try {
      const res = await fetch(`/api/applications/${application.id}/analyze`, {
        method: "POST",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const data = await res.json();
      setAnalysis(data.analysis);
      onAnalysisComplete(data.application);
      toast.success("AI Match Analysis Completed!", {
        description: `Resume Match: ${data.analysis.resumeMatch}%`,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze resume match");
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 60) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  return (
    <div className="space-y-5">
      {/* Run Analysis Trigger Header */}
      <div
        className="p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.25)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
            style={{ background: "var(--color-accent-primary)", color: "white" }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">AI Match & JD Analyzer</h4>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Evaluate ATS readability, skill match, and missing keywords.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={analyzing}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold text-white transition-all cursor-pointer hover:opacity-90 disabled:opacity-50 shrink-0"
          style={{ background: "var(--color-accent-primary)" }}
        >
          {analyzing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              <span>{analysis ? "Re-run Analysis" : "Run AI Analysis"}</span>
            </>
          )}
        </button>
      </div>

      {/* Analysis Results Display */}
      {analysis ? (
        <div className="space-y-5">
          {/* Summary Explanation Banner */}
          <div
            className="p-3.5 rounded-md text-xs border leading-relaxed"
            style={{
              background: "var(--color-bg-tertiary)",
              borderColor: "var(--color-border-secondary)",
              color: "var(--color-text-secondary)",
            }}
          >
            <span className="font-semibold text-white">Summary: </span>
            {analysis.explanation}
          </div>

          {/* Metric Score Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-lg border flex flex-col justify-between ${getScoreColor(analysis.resumeMatch)}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium opacity-90">Resume Match</span>
                <Target className="w-4 h-4 opacity-70" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold">{analysis.resumeMatch}%</span>
              </div>
            </div>

            <div className={`p-3 rounded-lg border flex flex-col justify-between ${getScoreColor(analysis.atsScore)}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium opacity-90">ATS Readability</span>
                <ShieldCheck className="w-4 h-4 opacity-70" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold">{analysis.atsScore}%</span>
              </div>
            </div>

            <div className={`p-3 rounded-lg border flex flex-col justify-between ${getScoreColor(analysis.readinessScore)}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium opacity-90">Readiness Rating</span>
                <Cpu className="w-4 h-4 opacity-70" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold">{analysis.readinessScore}%</span>
              </div>
            </div>

            <div className={`p-3 rounded-lg border flex flex-col justify-between ${getScoreColor(analysis.applicationStrength)}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium opacity-90">App Strength</span>
                <Sparkles className="w-4 h-4 opacity-70" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold">{analysis.applicationStrength}%</span>
              </div>
            </div>
          </div>

          {/* Skill Breakdown */}
          <div className="space-y-3 pt-2">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Skill & Keyword Audit
            </h5>

            {/* Matched Skills */}
            <div>
              <div className="text-xs text-[var(--color-text-tertiary)] mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Matched Skills ({analysis.matchedSkills.length})</span>
              </div>
              {analysis.matchedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {analysis.matchedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--color-text-muted)] italic">No explicit tech keywords matched.</p>
              )}
            </div>

            {/* Missing Skills */}
            <div className="pt-2">
              <div className="text-xs text-[var(--color-text-tertiary)] mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Missing Key Terms ({analysis.missingSkills.length})</span>
              </div>
              {analysis.missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {analysis.missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    >
                      + {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-400 font-medium">All key JD requirements found in resume!</p>
              )}
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="space-y-2 pt-2 border-t border-[var(--color-border-secondary)]">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Tailored Suggestions
            </h5>
            <div className="space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-2.5 rounded-md text-xs text-[var(--color-text-secondary)] flex items-start gap-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-secondary)]"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-[var(--color-accent-primary)] shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div
          className="p-6 rounded-lg text-center border space-y-2"
          style={{ background: "var(--color-bg-tertiary)", borderColor: "var(--color-border-secondary)" }}
        >
          <FileText className="w-8 h-8 mx-auto text-[var(--color-text-tertiary)]" />
          <h5 className="text-sm font-medium text-white">No AI Analysis Run Yet</h5>
          <p className="text-xs text-[var(--color-text-secondary)] max-w-xs mx-auto">
            Attach a resume version and add a Job Description to generate ATS score metrics and skill gap breakdowns.
          </p>
        </div>
      )}
    </div>
  );
}
