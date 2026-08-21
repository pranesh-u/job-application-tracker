import Link from "next/link";
import {
  Brain,
  Kanban,
  FileText,
  Sparkles,
  ArrowRight,
  Target,
  BarChart2,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <div
      className="min-h-screen text-white flex flex-col selection:bg-indigo-500 selection:text-white"
      style={{ background: "var(--color-bg-primary)" }}
    >
      {/* Top Header Navigation */}
      <header
        className="w-full border-b sticky top-0 backdrop-blur-md z-50"
        style={{
          borderColor: "var(--color-border-secondary)",
          background: "rgba(10, 10, 15, 0.8)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "var(--color-accent-primary)" }}
            >
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-semibold text-base tracking-tight text-white">
                CareerPulse <span style={{ color: "var(--color-accent-primary)" }}>AI</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/board"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 shadow-md shadow-indigo-500/20"
              style={{ background: "var(--color-accent-primary)" }}
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 max-w-5xl mx-auto text-center">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-6 border"
          style={{
            background: "rgba(99, 102, 241, 0.08)",
            borderColor: "rgba(99, 102, 241, 0.25)",
            color: "var(--color-accent-primary)",
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>No Login Required — Immediate Access</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight max-w-4xl">
          Accelerate Your Job Search With{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            AI Resume Intelligence
          </span>
        </h1>

        <p
          className="mt-6 text-base sm:text-lg max-w-2xl leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Track software engineering applications on an interactive Kanban board, manage
          role-tailored resume versions, and analyze ATS skill match against Job Descriptions.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/board"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95"
            style={{ background: "var(--color-accent-primary)" }}
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/resumes"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-sm font-medium transition-all border hover:bg-white/5 text-white"
            style={{
              background: "var(--color-bg-secondary)",
              borderColor: "var(--color-border-secondary)",
            }}
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Resume Version Hub</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {[
            {
              icon: Kanban,
              title: "Kanban Board Pipeline",
              desc: "Drag-and-drop applications through Wishlist, Applied, Interview, and Offer stages.",
            },
            {
              icon: FileText,
              title: "Resume Version Control",
              desc: "Manage targeted resumes (Backend, Frontend, Embedded) with automated text parsing.",
            },
            {
              icon: Target,
              title: "AI JD Matcher Engine",
              desc: "Evaluate ATS match score, identify missing technical skill gaps, and get bullet suggestions.",
            },
            {
              icon: BarChart2,
              title: "Conversion Metrics",
              desc: "Track interview conversion rates per resume type to double down on high-performing resumes.",
            },
            {
              icon: ShieldCheck,
              title: "Timeline Activity Log",
              desc: "Automatic event tracking for stage updates, priority adjustments, and note additions.",
            },
            {
              icon: Sparkles,
              title: "Instant Live Access",
              desc: "Full feature suite accessible immediately with zero sign-up friction.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border transition-all hover:border-indigo-500/40"
              style={{
                background: "var(--color-bg-secondary)",
                borderColor: "var(--color-border-secondary)",
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{
                  background: "rgba(99, 102, 241, 0.1)",
                  border: "1px solid rgba(99, 102, 241, 0.2)",
                }}
              >
                <feature.icon className="w-5 h-5" style={{ color: "var(--color-accent-primary)" }} />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer
        className="w-full border-t py-6 text-center text-xs"
        style={{
          borderColor: "var(--color-border-secondary)",
          color: "var(--color-text-tertiary)",
        }}
      >
        CareerPulse AI — Built for Software Engineers
      </footer>
    </div>
  );
}
