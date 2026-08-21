"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Application } from "@/types";
import KanbanCard from "./KanbanCard";

interface KanbanColumnProps {
  stage: { id: string; label: string; color: string };
  applications: Application[];
  index: number;
  onDelete: (id: string) => void;
  onCardClick?: (id: string) => void;
}

export default function KanbanColumn({
  stage,
  applications,
  index,
  onDelete,
  onCardClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      className="flex flex-col shrink-0 w-[272px] rounded-lg transition-colors"
      style={{
        background: isOver ? "var(--color-bg-tertiary)" : "var(--color-bg-secondary)",
        border: "1px solid var(--color-border-secondary)",
      }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2.5 shrink-0"
        style={{ borderBottom: "1px solid var(--color-border-secondary)" }}>
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: stage.color }}
          />
          <h3 className="text-[13px] font-medium text-white">{stage.label}</h3>
        </div>
        <span
          className="text-xs font-medium px-1.5 py-0.5 rounded"
          style={{
            background: `${stage.color}12`,
            color: stage.color,
          }}
        >
          {applications.length}
        </span>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className="flex-1 p-1.5 space-y-1.5 overflow-y-auto min-h-[100px]"
      >
        <SortableContext
          items={applications.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.map((app) => (
            <KanbanCard key={app.id} application={app} onDelete={onDelete} onClick={onCardClick} />
          ))}
        </SortableContext>

        {applications.length === 0 && (
          <div className="flex items-center justify-center h-16 rounded-md text-xs"
            style={{
              border: "1px dashed var(--color-border-secondary)",
              color: "var(--color-text-muted)",
            }}>
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
