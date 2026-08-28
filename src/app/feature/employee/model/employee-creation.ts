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