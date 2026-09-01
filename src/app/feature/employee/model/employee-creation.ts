export interface EmployeePersonalDto {
  firstName: string;
  secondName: string;
  thirdName: string;
  lastName: string;
  name: string;
  gender: number;
  dateOfBirth: string;
  nationality: string;
  nationalId: string;
  maritalStatus: number;
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  governorate: string;
  postalCode: string;
  country: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface EmployeeProfessionalDto {
  staffMemberTypeId: string;
  employmentType: number;
  departmentId: string;
  jobTitle: string;
  joiningDate: string;
  contractEndDate: string;
  yearsOfExperience: number;
  commissionPercent: number;
  baseSalary: number;
  isAdministrativeSector: boolean;
  qualification: string;
  specialty: string;
  insuranceNumber: string;
  licensingAuthority: string;
  registrationNumber: string;
  experienceSummary: string;
  bio: string;
  skills: string;
  certifications: string;
  languages: string;
}

export interface EmployeeAssignmentDto {
  roleId: string;
  company: string;
}

export interface EmployeePayload {
  personal: EmployeePersonalDto;
  professional: EmployeeProfessionalDto;
  assignment: EmployeeAssignmentDto;
}

export type EmployeeResponse = EmployeePayload; 

export interface Company {
  companyId: string;
  name: string;
  organizationId: string;
}

export interface Branch {
  branchId: string;
  name: string;
  companyId: string;
}

export interface Department {
  departmentId: string;
  name: string;
  branchId: string;
}

export interface Team {
  teamId: string;
  name: string;
  departmentId: string;
}

export interface OrganizationalStructure {
  currentLevel?: string;
  currentHeadId?: string;
  organizationId?: string;
  companies: Company[];
  branches: Branch[];
  departments: Department[];
  teams: Team[];
}

export interface SystemRole {
  id: string;
  name: string;
}

export interface CustomRole {
  id: string;
  name: string;
  teams: string[];
}

export interface RolesResponse {
  getAllCoustemRoles: any[];
  getAllSystemRoles: SystemRole[];
}

export interface AttachmentRow {
  id: string;
  label: string;
  file?: File;      
  date: Date;
  fileUrl?: string;
  isExisting?: boolean;
}