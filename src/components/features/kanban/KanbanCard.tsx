"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  MapPin,
  Clock,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Application, PRIORITY_CONFIG } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface KanbanCardProps {
  application: Application;
  isOverlay?: boolean;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
}

export default function KanbanCard({
  application,
  isOverlay,
  onDelete,
  onClick,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id });

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityConfig = PRIORITY_CONFIG[application.priority] || PRIORITY_CONFIG.Medium;

  const deadlineText = application.deadline
    ? formatDistanceToNow(new Date(application.deadline), { addSuffix: true })
    : null;

  const isDeadlineSoon =
    application.deadline &&
    new Date(application.deadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;

  const cardContent = (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={{
        ...(isOverlay ? {} : sortableStyle),
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border-secondary)",
        opacity: isDragging && !isOverlay ? 0.4 : 1,
      }}
      className={`rounded-lg p-2.5 group transition-colors hover:bg-[var(--color-bg-elevated)] ${
        isOverlay ? "scale-[1.02] cursor-grabbing" : "cursor-grab active:cursor-grabbing"
      }`}
      onClick={() => {
        if (!isOverlay && onClick && !isDragging) {
          onClick(application.id);
        }
      }}
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
    >
      {/* Top Row: Company & Priority */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-[13px] font-medium text-white truncate">
              {application.company}
            </h4>
            {application.jobUrl && (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" style={{ color: "var(--color-text-tertiary)" }} />
              </a>
            )}
          </div>
          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text-secondary)" }}>
            {application.role}
          </p>
        </div>

        {/* Priority Badge */}
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wide"
          style={{
            background: `${priorityConfig.color}15`,
            color: priorityConfig.color,
          }}
        >
          {priorityConfig.label}
        </span>
      </div>

      {/* Meta Info */}
      <div className="flex items-center gap-3 mt-1.5">
        {application.location && (
          <div className="flex items-center gap-1 text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[80px]">{application.location}</span>
          </div>
        )}
        {deadlineText && (
          <div
            className="flex items-center gap-1 text-[11px]"
            style={{ color: isDeadlineSoon ? "var(--color-status-warning)" : "var(--color-text-tertiary)" }}
          >
            <Clock className="w-3 h-3" />
            <span>{deadlineText}</span>
          </div>
        )}
      </div>

      {/* AI Scores (if available) */}
      {(application.resumeMatch !== null || application.applicationStrength !== null) && (
        <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: "1px solid var(--color-border-secondary)" }}>
          {application.resumeMatch !== null && (
            <ScoreBadge label="Match" value={application.resumeMatch} />
          )}
          {application.applicationStrength !== null && (
            <ScoreBadge label="Strength" value={application.applicationStrength} />
          )}
        </div>
      )}

      {/* Actions (visible on hover) */}
      <div className="flex items-center justify-between mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1">
          <GripVertical className="w-3.5 h-3.5" style={{ color: "var(--color-text-muted)" }} />
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(application.id);
            }}
            className="p-1 rounded transition-colors hover:bg-red-500/10 cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" style={{ color: "var(--color-status-error)" }} />
          </button>
        )}
      </div>
    </div>
  );

  return cardContent;
}

function ScoreBadge({ label, value }: { label: string; value: number }) {
  const percentage = Math.round(value);
  const color =
    percentage >= 80
      ? "var(--color-status-success)"
      : percentage >= 60
        ? "var(--color-status-warning)"
        : "var(--color-status-error)";

  return (
    <div className="flex items-center gap-1.5 text-[11px]">
      <div className="w-14 h-1 rounded-full overflow-hidden" style={{ background: "var(--color-bg-tertiary)" }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${percentage}%`, background: color }}
        />
      </div>
      <span style={{ color: "var(--color-text-tertiary)" }}>
        {label} {percentage}%
      </span>
    </div>
  );
}
