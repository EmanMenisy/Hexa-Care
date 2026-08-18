export interface GetRoleRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  isActive?: boolean;
  sortByLastAdded?: boolean;
}

export interface RoleFilters{
  IsActive:boolean|null
}