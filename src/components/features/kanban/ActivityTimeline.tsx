import { useState } from "react";
import { TimelineEvent } from "@/types";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  ArrowRightCircle,
  PlusCircle,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface ActivityTimelineProps {
  applicationId: string;
  events: TimelineEvent[];
  onEventAdded: (event: TimelineEvent) => void;
}

export default function ActivityTimeline({
  applicationId,
  events,
  onEventAdded,
}: ActivityTimelineProps) {
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "note_added",
          title: "Added a note",
          description: newNote.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to add note");

      const event = await res.json();
      onEventAdded(event);
      setNewNote("");
      toast.success("Note added");
    } catch (error) {
      toast.error("Failed to add note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "stage_change":
        return <ArrowRightCircle className="w-3.5 h-3.5 text-blue-400" />;
      case "note_added":
        return <MessageSquare className="w-3.5 h-3.5 text-purple-400" />;
      case "priority_change":
        return <AlertCircle className="w-3.5 h-3.5 text-orange-400" />;
      case "created":
        return <PlusCircle className="w-3.5 h-3.5 text-green-400" />;
      case "resume_selected":
        return <FileText className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Note Input */}
      <div className="p-4 shrink-0" style={{ borderBottom: "1px solid var(--color-border-secondary)" }}>
        <form onSubmit={handleAddNote} className="relative">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note or update..."
            rows={2}
            className="w-full px-2.5 py-2 rounded-md text-sm text-white placeholder-[var(--color-text-muted)] outline-none transition-colors focus:ring-1 focus:ring-[var(--color-accent-primary)] resize-none"
            style={{
              background: "var(--color-bg-tertiary)",
              border: "1px solid var(--color-border-secondary)",
            }}
          />
          <div className="flex justify-end mt-1.5">
            <button
              type="submit"
              disabled={isSubmitting || !newNote.trim()}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium text-white transition-colors disabled:opacity-40 cursor-pointer hover:opacity-90"
              style={{ background: "var(--color-accent-primary)" }}
            >
              {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
              Save Note
            </button>
          </div>
        </form>
      </div>

      {/* Timeline Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {events.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: "var(--color-text-tertiary)" }}>
            No activity yet.
          </div>
        ) : (
          <div className="relative border-l border-[var(--color-border-secondary)] ml-3 space-y-5">
            {events.map((event) => (
              <div key={event.id} className="relative pl-5">
                <div
                  className="absolute -left-[9px] top-1 p-0.5 rounded-full bg-[var(--color-bg-secondary)]"
                  style={{ border: "1px solid var(--color-border-secondary)" }}
                >
                  {getEventIcon(event.eventType)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{event.title}</span>
                    <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                      {formatDistanceToNow(new Date(event.occurredAt), { addSuffix: true })}
                    </span>
                  </div>
                  {event.description && (
                    <p className="mt-0.5 text-sm whitespace-pre-wrap" style={{ color: "var(--color-text-secondary)" }}>
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
