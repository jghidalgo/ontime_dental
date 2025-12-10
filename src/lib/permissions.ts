// Permission management utilities for role-based access control

export interface UserPermissions {
  modules: string[];
  canModifySchedules?: boolean;
  canModifyDocuments?: boolean;
  canViewAllTickets?: boolean;
  canModifyTickets?: boolean;
  canViewReports?: boolean;
  canManageUsers?: boolean;
  canModifyContacts?: boolean;
  canAccessLaboratory?: boolean;
  canManageTransit?: boolean;
}

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: string;
  companyId?: string;
  permissions?: UserPermissions;
}

// Default permissions by role
export const ROLE_PERMISSIONS: Record<string, UserPermissions> = {
  admin: {
    modules: ['dashboard', 'documents', 'contacts', 'schedules', 'tickets', 'laboratory', 'insurances'],
    canModifySchedules: true,
    canModifyDocuments: true,
    canViewAllTickets: true,
    canModifyTickets: true,
    canViewReports: true,
    canManageUsers: true,
    canModifyContacts: true,
    canAccessLaboratory: true,
    canManageTransit: true
  },
  manager: {
    modules: ['dashboard', 'documents', 'contacts', 'schedules', 'tickets', 'laboratory'],
    canModifySchedules: true,
    canModifyDocuments: true,
    canViewAllTickets: true,
    canModifyTickets: true,
    canViewReports: true,
    canManageUsers: false,
    canModifyContacts: true,
    canAccessLaboratory: true,
    canManageTransit: false
  },
  dentist: {
    modules: ['dashboard', 'schedules', 'tickets', 'laboratory', 'documents'],
    canModifySchedules: false,
    canModifyDocuments: true,
    canViewAllTickets: false,
    canModifyTickets: true,
    canViewReports: false,
    canManageUsers: false,
    canModifyContacts: false,
    canAccessLaboratory: true,
    canManageTransit: false
  },
  hygienist: {
    modules: ['dashboard', 'schedules', 'tickets', 'documents'],
    canModifySchedules: false,
    canModifyDocuments: true,
    canViewAllTickets: false,
    canModifyTickets: true,
    canViewReports: false,
    canManageUsers: false,
    canModifyContacts: false,
    canAccessLaboratory: false,
    canManageTransit: false
  },
  assistant: {
    modules: ['dashboard', 'schedules', 'tickets', 'documents'],
    canModifySchedules: false,
    canModifyDocuments: true,
    canViewAllTickets: false,
    canModifyTickets: true,
    canViewReports: false,
    canManageUsers: false,
    canModifyContacts: false,
    canAccessLaboratory: false,
    canManageTransit: false
  },
  receptionist: {
    modules: ['dashboard', 'schedules', 'tickets', 'contacts', 'documents'],
    canModifySchedules: false,
    canModifyDocuments: true,
    canViewAllTickets: false,
    canModifyTickets: true,
    canViewReports: false,
    canManageUsers: false,
    canModifyContacts: true,
    canAccessLaboratory: false,
    canManageTransit: false
  },
  lab_tech: {
    modules: ['dashboard', 'laboratory', 'tickets', 'documents'],
    canModifySchedules: false,
    canModifyDocuments: true,
    canViewAllTickets: false,
    canModifyTickets: true,
    canViewReports: false,
    canManageUsers: false,
    canModifyContacts: false,
    canAccessLaboratory: true,
    canManageTransit: true
  }
};

// Check if user has access to a specific module
export function hasModuleAccess(user: UserSession | null, module: string): boolean {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'manager') return true;
  return user.permissions?.modules?.includes(module) || false;
}

// Check if user can perform a specific action
export function hasPermission(user: UserSession | null, permission: keyof UserPermissions): boolean {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'manager') return true;
  return user.permissions?.[permission] === true;
}

// Get user session from localStorage
export function getUserSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const token = globalThis.localStorage.getItem('ontime.authToken');
    const userDataStr = globalThis.localStorage.getItem('ontime.userData');
    
    if (!token || !userDataStr) return null;
    
    const userData = JSON.parse(userDataStr);
    return userData as UserSession;
  } catch (error) {
    console.error('Error getting user session:', error);
    return null;
  }
}

// Save user session to localStorage
export function saveUserSession(userData: UserSession, token: string): void {
  if (typeof window === 'undefined') return;
  
  globalThis.localStorage.setItem('ontime.authToken', token);
  globalThis.localStorage.setItem('ontime.userData', JSON.stringify(userData));
}

// Clear user session
export function clearUserSession(): void {
  if (typeof window === 'undefined') return;
  
  globalThis.localStorage.removeItem('ontime.authToken');
  globalThis.localStorage.removeItem('ontime.userData');
}

// Get default permissions for a role
export function getDefaultPermissions(role: string): UserPermissions {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.receptionist;
}

// Check if user owns a resource (e.g., their own ticket)
export function isResourceOwner(user: UserSession | null, resourceOwnerId: string): boolean {
  if (!user) return false;
  return user.userId === resourceOwnerId || user.email === resourceOwnerId;
}
