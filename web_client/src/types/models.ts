export enum UserRole {
  chapterAdmin = 'chapterAdmin',
  secretary = 'secretary',
  treasurer = 'treasurer',
  techHead = 'techHead',
  prMedia = 'prMedia',
  contentDoc = 'contentDoc',
  designTeam = 'designTeam',
  eventMgmt = 'eventMgmt',
  sheTeam = 'sheTeam',
  internship = 'internship',
  execomCore = 'execomCore',
  generalMember = 'generalMember',
  facultyAdvisor = 'facultyAdvisor'
}

export const ROOT_ADMINS = [
  "adhithyamohans.b24ec1205@mbcet.ac.in",
  "govindwarrier.b25ec1232@mbcet.ac.in",
  "snithshibu.b23ec1156@mbcet.ac.in",
  "melvin.jacob@mbcet.ac.in"
];

export enum UserStatus {
  active = 'active',
  idle = 'idle',
  reviewRequired = 'reviewRequired'
}

export interface ExecomMember {
  id: string;
  fullName: string;
  email: string;
  branchBatch: string;
  department: string;
  contact: string;
  skills: string[];
  areasOfExpertise: string;
  socialLinks: Record<string, string>;
  role: UserRole;
  designation: string;
  activeStatus: UserStatus;
  corePoints: number;
  photoURL?: string;
  teamId?: string;
}

export enum TaskState {
  pending = 'pending',
  inProgress = 'inProgress',
  underReview = 'underReview',
  completed = 'completed',
  blocked = 'blocked'
}

export enum TaskPriority {
  low = 'low',
  medium = 'medium',
  high = 'high',
  critical = 'critical'
}

export interface TaskComment {
  id: string;
  authorId: string;
  content: string;
  timestamp: string; // ISO string
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  assignedMemberId: string;
  teamId: string;
  targetDeadline: string; // ISO string
  potentialPoints: number;
  state: TaskState;
  priority: TaskPriority;
  progressPercentage: number;
  comments: TaskComment[];
  attachmentUrls: string[];
}

// ─── Energy Points System ───────────────────────────────────────────────────

export enum EnergyPointStatus {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
}

export interface EnergyPointRequest {
  id: string;
  memberId: string;
  memberName: string;
  category: string;       // e.g. "Event Coordination", "Technical Contribution"
  description: string;    // What they did
  proofUrl: string;       // Link to evidence (drive, github, etc.)
  requestedPoints: number;
  awardedPoints?: number; // Set by chairperson on approval
  status: EnergyPointStatus;
  chairpersonNote?: string;
  submittedAt: string;    // ISO string
  reviewedAt?: string;    // ISO string
}

// ─── Whitelist / Access Control ───────────────────────────────────────────

export interface AllowedUser {
  email: string;           // Firestore document ID (lowercase email)
  role: UserRole;
  designation: string;
  fullName?: string;
  teamId?: string;
  branchBatch?: string;
  department?: string;
  addedBy: string;         // UID or 'seed-script'
  addedAt: string;         // ISO string
  isActive: boolean;
}

// ─── Notifications ────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
  readBy: string[];
}

// ─── Teams ───────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;           // e.g. "Web Development", "Design"
  description: string;    // Scope/Purpose
  leaderId: string | null; // UID of the team lead
  memberIds: string[];    // Array of UIDs
  createdAt: string;      // ISO string
}

// ─── Performance Evaluation ─────────────────────────────────────────────────

export interface EventPointAllocation {
  id: string;
  eventName: string;
  points: number;
  note?: string;
  allocatedAt: string; // ISO string
}

export interface EvaluationScore {
  memberId: string;
  departmentScore: number;    // 0–6
  initiativeScore: number;    // 0–2
  reliabilityScore: number;   // 0–1
  attendanceScore: number;    // 0–1
  eventAllocations?: EventPointAllocation[];
  totalScore: number;         // sum of above, 0–10
  lastUpdated: string;        // ISO string
  updatedBy: string;          // admin uid
}

export type ContributionStatus = 'pending' | 'verified' | 'rejected';

export interface ContributionEntry {
  id: string;
  memberId: string;
  date: string;               // e.g. "2026-06-25"
  task: string;               // description of what was done
  proofUrl: string;           // drive / github link
  submittedAt: string;        // ISO string
  status: ContributionStatus;
  adminNote?: string;
}
