import { ExecomMember, UserRole, ROOT_ADMINS } from '@/types/models';

export enum Permission {
  MANAGE_USERS = 'manage_users',
  MANAGE_EVALUATIONS = 'manage_evaluations',
  MANAGE_TASKS = 'manage_tasks',
  MANAGE_EVENTS = 'manage_events',
  MANAGE_VAULT = 'manage_vault',
  MANAGE_TEAMS = 'manage_teams',
  VIEW_FINANCE = 'view_finance',
  ACCESS_HUB = 'access_hub',
  MANAGE_POINTS = 'manage_points',
}

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.chapterAdmin]: Object.values(Permission), // Chapter Admins have all permissions
  [UserRole.secretary]: [], 
  [UserRole.treasurer]: [],
  [UserRole.techHead]: [],
  [UserRole.prMedia]: [],
  [UserRole.contentDoc]: [],
  [UserRole.designTeam]: [],
  [UserRole.eventMgmt]: [],
  [UserRole.sheTeam]: [],
  [UserRole.internship]: [],
  [UserRole.execomCore]: [],
  [UserRole.generalMember]: [],
  [UserRole.facultyAdvisor]: [],
};

export function hasPermission(user: ExecomMember | null, permission: Permission): boolean {
  if (!user) return false;
  
  const email = user.email.toLowerCase().trim();
  if (ROOT_ADMINS.includes(email)) return true;

  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
}

export function isRootOrChapterAdmin(user: ExecomMember | null): boolean {
  if (!user) return false;
  const email = user.email.toLowerCase().trim();
  if (ROOT_ADMINS.includes(email)) return true;
  return user.role === UserRole.chapterAdmin;
}
