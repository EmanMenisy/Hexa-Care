// login-response.model.ts

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  accessToken: string | null;
  refreshToken: string | null;
  refreshTokenExpiry: string;
  currentRoleID: string;
  currentHeadId: string;
  accessTokenExpiry: string;
  userID: string;
  name: string;
  organizationID: string;

  modules: Module[];
  message: string | null;

  employeeID: string | null;
  employeeImageUrl: string | null;
  isOnBoardingOperationCompleted: boolean;

  allRolesWithHierarchy: AllRolesWithHierarchy;
}

// ==========================================
// Module
// ==========================================

export interface Module {
  id: string;
  code: string;
  name: string;
  pages: Page[];
}

// ==========================================
// Page
// ==========================================

export interface Page {
  id: string;
  code: string;
  name: string;
  features: Feature[];
}

// ==========================================
// Feature
// ==========================================

export interface Feature {
  id: string;
  code: number;
  name: string;
  actionType: string;
}

// ==========================================
// Roles & Hierarchy
// ==========================================

export interface AllRolesWithHierarchy {
  systemRolesWithHierarchy: RoleWithHierarchy[];
  customerRolesWithHierarchy: RoleWithHierarchy[];
}

export interface RoleWithHierarchy {
  roleId: string;
  roleName: string;
  hierarchyList: Hierarchy[];
}

export interface Hierarchy {
  hrarircyId: string;
  hrarircyName: string;
}

// ==========================================
// API Response Wrapper
// ==========================================

export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
  errorCode: number;
  isAuthorized: boolean;
}