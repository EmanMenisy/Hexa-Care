export interface GetRoleRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  isActive?: boolean;
  sortByLastAdded?: boolean;
}

export interface RoleFilters{
  IsActive:boolean|null
}

export interface RoleResponse {
  id: string;
  name: string;
  description: string;
  roleCode: string;
  isSystemRole: boolean;
  isActive: boolean;
  createdDate: string;
  usersCount: number;
  parentViewModels: ParentRole[];
}

export interface ParentRole {
  id: string;
  name: string;
}

export interface RolePayload {
  id?: string;
  roleCode: string;
  parentRoleId: string[];
  isActive: boolean;
  name: string;
  description?: string;
  isAssigneStructure?: boolean;
  assigneStructure?: AssignStructure;
}

export interface AssignStructure {
  organzationId: string;
  company: CompanyStructure[];
}

export interface CompanyStructure {
  id: string;
  branches: BranchStructure[];
}

export interface BranchStructure {
  id: string;
  departments: DepartmentStructure[];
}

export interface DepartmentStructure {
  id: string;
  teamId: string[];
}
export interface ParentRoles {
  id: string;
  name: string;
}