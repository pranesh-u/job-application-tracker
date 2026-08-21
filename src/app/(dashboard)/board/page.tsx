"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Application, KANBAN_STAGES } from "@/types";
import KanbanColumn from "@/components/features/kanban/KanbanColumn";
import KanbanCard from "@/components/features/kanban/KanbanCard";
import NewApplicationModal from "@/components/features/kanban/NewApplicationModal";
import ApplicationDetailPanel from "@/components/features/kanban/ApplicationDetailPanel";

export default function BoardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch("/api/applications");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setApplications(data);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const getColumnApps = (stageId: string) => {
    return applications
      .filter((app) => app.stage === stageId)
      .filter((app) =>
        searchQuery
          ? app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.role.toLowerCase().includes(searchQuery.toLowerCase())
          : true
      )
      .sort((a, b) => a.kanbanOrder - b.kanbanOrder);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const app = applications.find((a) => a.id === event.active.id);
    setActiveApp(app || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeApp = applications.find((a) => a.id === activeId);
    if (!activeApp) return;

    // Determine target stage
    const isOverColumn = KANBAN_STAGES.some((s) => s.id === overId);
    const targetStage = isOverColumn
      ? overId
      : applications.find((a) => a.id === overId)?.stage;

    if (!targetStage || activeApp.stage === targetStage) return;

    // Optimistic update - move to new column
    setApplications((prev) =>
      prev.map((app) =>
        app.id === activeId ? { ...app, stage: targetStage } : app
      )
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveApp(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const app = applications.find((a) => a.id === activeId);
    if (!app) return;

    // Determine the final stage
    const isOverColumn = KANBAN_STAGES.some((s) => s.id === overId);
    const targetStage = isOverColumn
      ? overId
      : applications.find((a) => a.id === overId)?.stage || app.stage;

    // Update on server
    try {
      const res = await fetch(`/api/applications/${activeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: targetStage }),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success(`Moved to ${targetStage}`, {
        description: `${app.company} - ${app.role}`,
      });
    } catch {
      toast.error("Failed to update application");
      fetchApplications(); // Revert
    }
  };

  const handleApplicationCreated = (app: Application) => {
    setApplications((prev) => [...prev, app]);
    setShowNewModal(false);
    toast.success("Application created!", {
      description: `${app.company} - ${app.role}`,
    });
  };

  const handleDeleteApplication = async (id: string) => {
    const app = applications.find((a) => a.id === id);
    setApplications((prev) => prev.filter((a) => a.id !== id));

    try {
      const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Application deleted", {
        description: app ? `${app.company} - ${app.role}` : undefined,
      });
    } catch {
      toast.error("Failed to delete application");
      fetchApplications();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--color-accent-primary)" }} />
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Loading your board...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Application Board</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {applications.length} application{applications.length !== 1 ? "s" : ""} tracked
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--color-text-tertiary)" }} />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 pl-9 pr-3 py-1.5 rounded-md text-sm text-white placeholder-[var(--color-text-muted)] outline-none transition-colors focus:ring-1 focus:ring-[var(--color-accent-primary)]"
              style={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border-secondary)" }}
            />
          </div>

          {/* Filter Button */}
          <button
            className="p-1.5 rounded-md transition-colors hover:bg-[var(--color-bg-hover)] cursor-pointer"
            style={{ border: "1px solid var(--color-border-secondary)" }}
            title="Filters (coming soon)"
          >
            <Filter className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} />
          </button>

          {/* New Application */}
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-white transition-colors hover:opacity-90 cursor-pointer"
            style={{ background: "var(--color-accent-primary)" }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Application</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6" style={{ minHeight: "calc(100vh - 200px)" }}>
          {KANBAN_STAGES.map((stage, index) => {
            const columnApps = getColumnApps(stage.id);
            return (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                applications={columnApps}
                index={index}
                onDelete={handleDeleteApplication}
                onCardClick={setSelectedAppId}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeApp ? (
            <div style={{ width: "264px" }}>
              <KanbanCard application={activeApp} isOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* New Application Modal */}
      {showNewModal && (
        <NewApplicationModal
          onClose={() => setShowNewModal(false)}
          onCreated={handleApplicationCreated}
        />
      )}

      {/* Application Detail Panel */}
      {selectedAppId && (
        <ApplicationDetailPanel
          applicationId={selectedAppId}
          onClose={() => setSelectedAppId(null)}
          onUpdate={(updatedApp) => {
            setApplications((prev) =>
              prev.map((a) => (a.id === updatedApp.id ? updatedApp : a))
            );
          }}
        />
      )}
    </div>
  );
}
