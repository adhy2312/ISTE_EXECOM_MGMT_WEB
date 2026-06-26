import { UserRole } from "@/types/models";

export const ROLE_OPTIONS: { value: UserRole; label: string; color: string; bg: string }[] = [
  { value: UserRole.chapterAdmin, label: "Chapter Admin", color: "#EF4444", bg: "rgba(239, 68, 68, 0.1)" },
  { value: UserRole.secretary, label: "Secretary", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)" },
  { value: UserRole.treasurer, label: "Treasurer", color: "#10B981", bg: "rgba(16, 185, 129, 0.1)" },
  { value: UserRole.techHead, label: "Tech Head", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.1)" },
  { value: UserRole.prMedia, label: "PR & Media", color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.1)" },
  { value: UserRole.contentDoc, label: "Content & Doc", color: "#EC4899", bg: "rgba(236, 72, 153, 0.1)" },
  { value: UserRole.generalMember, label: "General Member", color: "#6B7280", bg: "rgba(107, 114, 128, 0.1)" },
];

export const DESIGNATION_OPTIONS = [
  "Chairperson",
  "Vice Chairperson",
  "Secretary",
  "Joint Secretary",
  "Treasurer",
  "Technical Head",
  "Webmaster",
  "Design Head",
  "PR & Media Head",
  "Content & Documentation Head",
  "Event Management Head",
  "SHE Team Lead",
  "Internship Coordinator",
  "Executive Member",
  "General Member",
  "Faculty Advisor"
];
