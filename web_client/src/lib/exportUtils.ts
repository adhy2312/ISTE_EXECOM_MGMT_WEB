import { ExecomMember, EnergyPointRequest, TaskItem, Team } from "@/types/models";

// Helper to escape CSV values
const escapeCSV = (val: string | number | undefined | null) => {
  if (val === null || val === undefined) return "";
  const str = String(val);
  // If the string contains quotes, commas, or newlines, wrap in quotes and escape internal quotes
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// Generic downloader
export const downloadCSV = (filename: string, headers: string[], rows: (string | number | undefined | null)[][]) => {
  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map(row => row.map(escapeCSV).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Specific Builders
export const exportLeaderboardToCSV = (members: ExecomMember[], teams: Team[]) => {
  const headers = ["Rank", "Name", "Email", "Role", "Designation", "Team", "Core Points", "Department"];
  
  // Sort members by points descending
  const sorted = [...members].sort((a, b) => b.corePoints - a.corePoints);
  
  const rows = sorted.map((m, idx) => {
    const team = teams.find(t => t.id === m.teamId)?.name ?? "Unassigned";
    return [
      idx + 1,
      m.fullName,
      m.id, // Email is the ID
      m.role,
      m.designation,
      team,
      m.corePoints,
      m.department ?? "N/A"
    ];
  });

  downloadCSV(`leaderboard_export_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
};

export const exportPointLogsToCSV = (requests: EnergyPointRequest[]) => {
  const headers = ["Status", "Member Name", "Member Email", "Category", "Description", "Requested Points", "Awarded Points", "Submitted At", "Reviewed At", "Chairperson Note"];
  
  // Sort by date submitted
  const sorted = [...requests].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const rows = sorted.map(r => [
    r.status.toUpperCase(),
    r.memberName,
    r.memberId,
    r.category,
    r.description,
    r.requestedPoints,
    r.awardedPoints ?? 0,
    new Date(r.submittedAt).toLocaleString(),
    r.reviewedAt ? new Date(r.reviewedAt).toLocaleString() : "Pending",
    r.chairpersonNote ?? ""
  ]);

  downloadCSV(`point_logs_export_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
};

export const exportTasksToCSV = (tasks: TaskItem[]) => {
  const headers = ["Title", "Description", "Deadline", "Points", "State", "Assigned To"];
  
  const sorted = [...tasks].sort((a, b) => new Date(b.targetDeadline).getTime() - new Date(a.targetDeadline).getTime());

  const rows = sorted.map(t => [
    t.title,
    t.description,
    new Date(t.targetDeadline).toLocaleDateString(),
    t.potentialPoints,
    t.state,
    t.assignedMemberId || "Unassigned"
  ]);

  downloadCSV(`tasks_export_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
};
