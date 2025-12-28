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

function normalizeRole(role: unknown): string {
  if (typeof role !== 'string') return '';
  return role.trim().toLowerCase();
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const payloadB64Url = parts[1];
    const payloadB64 = payloadB64Url.replaceAll('-', '+').replaceAll('_', '/');
    const padLength = (4 - (payloadB64.length % 4)) % 4;
    const padded = payloadB64 + '='.repeat(padLength);

    const json = globalThis.atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
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
  if (globalThis.window === undefined) return null;
  
  try {
    const token = globalThis.localStorage.getItem('ontime.authToken');
    const userDataStr = globalThis.localStorage.getItem('ontime.userData');
    
    if (!token) return null;

    if (userDataStr) {
      const userData = JSON.parse(userDataStr) as UserSession;
      return {
        ...userData,
        role: normalizeRole(userData.role)
      };
    }

    // Backward compatibility: if `ontime.userData` is missing but token exists,
    // try to reconstruct a minimal session from JWT + legacy localStorage keys.
    const payload = decodeJwtPayload(token);
    if (!payload) return null;

    const legacyName = globalThis.localStorage.getItem('ontime.userName') || 'User';
    const legacyPermissionsStr = globalThis.localStorage.getItem('ontime.userPermissions');
    const legacyPermissions = legacyPermissionsStr
      ? (JSON.parse(legacyPermissionsStr) as UserPermissions)
      : undefined;

    const reconstructed: UserSession = {
      userId: typeof payload.sub === 'string' ? payload.sub : '',
      email: typeof payload.email === 'string' ? payload.email : '',
      name: typeof payload.name === 'string' ? payload.name : legacyName,
      role: normalizeRole(payload.role),
      permissions: legacyPermissions
    };

    if (!reconstructed.userId || !reconstructed.email) return null;
    return reconstructed;
  } catch (error) {
    console.error('Error getting user session:', error);
    return null;
  }
}

// Save user session to localStorage
export function saveUserSession(userData: UserSession, token: string): void {
  if (globalThis.window === undefined) return;
  
  globalThis.localStorage.setItem('ontime.authToken', token);
  globalThis.localStorage.setItem('ontime.userData', JSON.stringify({
    ...userData,
    role: normalizeRole(userData.role)
  }));

  // Keep legacy keys in sync for older components.
  globalThis.localStorage.setItem('ontime.userName', userData.name);
  if (userData.permissions) {
    globalThis.localStorage.setItem('ontime.userPermissions', JSON.stringify(userData.permissions));
  }
}

// Clear user session
export function clearUserSession(): void {
  if (globalThis.window === undefined) return;
  
  globalThis.localStorage.removeItem('ontime.authToken');
  globalThis.localStorage.removeItem('ontime.userData');
  globalThis.localStorage.removeItem('ontime.userName');
  globalThis.localStorage.removeItem('ontime.userPermissions');
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
