// TypeScript types for the application
export interface Application {
  id: string;
  userId: string;
  resumeVersionId: string | null;
  company: string;
  role: string;
  location: string | null;
  jobUrl: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  applicationDate: string | null;
  deadline: string | null;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: string;
  stage: string;
  notes: string | null;
  jobDescription: string | null;
  recruiterName: string | null;
  recruiterEmail: string | null;
  recruiterPhone: string | null;
  kanbanOrder: number;
  resumeMatch: number | null;
  atsScore: number | null;
  readinessScore: number | null;
  applicationStrength: number | null;
  analysisData: string | null;
  createdAt: string;
  updatedAt: string;
  timelineEvents?: TimelineEvent[];
  resumeVersion?: ResumeVersion | null;
}

export interface ResumeVersion {
  id: string;
  resumeId: string;
  versionNumber: number;
  filePath: string;
  fileName: string;
  fileSize: number;
  isActive: boolean;
  uploadedAt: string;
  profileData: string | null;
  rawText: string | null;
  analyzedAt: string | null;
  applications?: Application[];
}

export interface Resume {
  id: string;
  userId: string;
  name: string;
  type: string;
  usageCount: number;
  interviewRate: number;
  createdAt: string;
  updatedAt: string;
  versions?: ResumeVersion[];
  activeVersion?: ResumeVersion;
}

export interface TimelineEvent {
  id: string;
  applicationId: string;
  eventType: string;
  title: string;
  description: string | null;
  metadata: string | null;
  occurredAt: string;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  applicationId: string | null;
  eventType: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  color: string;
  reminderSent: boolean;
  reminderTime: string | null;
  createdAt: string;
}

export const KANBAN_STAGES = [
  { id: "Wishlist", label: "Wishlist", color: "#6366f1" },
  { id: "Preparing", label: "Preparing", color: "#8b5cf6" },
  { id: "Applied", label: "Applied", color: "#3b82f6" },
  { id: "Online Assessment", label: "OA", color: "#f59e0b" },
  { id: "Technical Interview", label: "Technical", color: "#f97316" },
  { id: "HR Interview", label: "HR", color: "#ec4899" },
  { id: "Offer", label: "Offer", color: "#10b981" },
  { id: "Accepted", label: "Accepted", color: "#059669" },
  { id: "Rejected", label: "Rejected", color: "#ef4444" },
] as const;

export const PRIORITY_CONFIG = {
  Low: { color: "#6b7280", label: "Low" },
  Medium: { color: "#3b82f6", label: "Medium" },
  High: { color: "#f59e0b", label: "High" },
  Critical: { color: "#ef4444", label: "Critical" },
} as const;

export const RESUME_TYPES = [
  "General",
  "Frontend",
  "Backend",
  "Full Stack",
  "Embedded",
  "AI/ML",
  "Management",
  "Internship",
] as const;

export type KanbanStage = (typeof KANBAN_STAGES)[number]["id"];
export type Priority = keyof typeof PRIORITY_CONFIG;
export type ResumeType = (typeof RESUME_TYPES)[number];
