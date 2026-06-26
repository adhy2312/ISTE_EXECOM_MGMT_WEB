export interface CheckList {
  id: string;
  label: string;
  done: boolean;
}

export interface HubEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  status: "upcoming" | "planning" | "past";
  checklists: CheckList[];
  createdAt: number;
}

export interface HubMeeting {
  id: string;
  title: string;
  date: string;
  status: "upcoming" | "past";
  actionItems: number;
  completedItems: number;
  attendance: number;
  total: number;
  meetLink?: string;
  agendaUrl?: string;
  minutesUrl?: string;
  createdAt: number;
}

export interface HubVaultResource {
  id: string;
  name: string;
  type: "folder" | "pdf" | "doc" | "link" | "sop";
  category: "assets" | "documents" | "links" | "sops";
  url?: string;
  items?: number;
  size?: string;
  description?: string;
  createdAt: number;
}


