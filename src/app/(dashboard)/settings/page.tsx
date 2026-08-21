import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-white">Settings</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            Manage your account and preferences
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-16 rounded-lg"
        style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border-secondary)" }}>
        <div className="w-10 h-10 rounded-md flex items-center justify-center mb-3"
          style={{ background: "rgba(99, 102, 241, 0.08)" }}>
          <SettingsIcon className="w-5 h-5" style={{ color: "var(--color-accent-primary)" }} />
        </div>
        <h3 className="text-sm font-medium text-white mb-1">Settings</h3>
        <p className="text-xs max-w-xs text-center" style={{ color: "var(--color-text-secondary)" }}>
          Theme preferences, notification settings, and account management.
        </p>
        <p className="text-xs mt-3 px-2.5 py-1 rounded-md" style={{ background: "var(--color-bg-tertiary)", color: "var(--color-text-tertiary)" }}>
          Coming soon
        </p>
      </div>
    </div>
  );
}
