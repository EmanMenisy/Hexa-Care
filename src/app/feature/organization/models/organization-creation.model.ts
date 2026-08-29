export enum HierarchySteps {
  Organization = 0,
  Company = 1,
  Branch = 2,
  Department = 3,
  Team = 4
}
// =====================================
// SHARED LOCATION MODELS
// =====================================

export class LocationCenter {
  latitude: number = 0;
  longitude: number = 0;
}

export class GeoLocation {
  center: LocationCenter = new LocationCenter();
  radiusInMeters: number = 0;
}


// =====================================
// COMPANY
// =====================================

export class CompanyCreate {
  name: string = '';
  nameArabic: string = '';
  code: string = '';

  address: string = '';

  countryId: string | null = null;
  cityId: string | null = null;
  stateId: string | null = null;
  otherCityName: string | null = null;

  commercialRegisterNo: string = '';
  taxNumber: string = '';
  licenseNumber: string = '';

  description: string = '';
  descriptionArabic: string = '';

  phone: string = '';
  email: string = '';
  website: string = '';
  logoUrl: string = '';

  managerName: string = '';
  managerPhone: string = '';
  managerEmail: string = '';

  medicalDirector: string = '';
  medicalDirectorPhone: string = '';
  medicalDirectorEmail: string = '';

  createBranch: BranchCreate | null = null;
}


// =====================================
// BRANCH
// Used both inside Company and root level
// =====================================

export class BranchCreate {
  name: string = '';
  nameArabic: string = '';

  description: string = '';
  descriptionArabic: string = '';

  address: string = '';

  phone: string = '';
  email: string = '';

  countryId: string | null = null;
  cityId: string | null = null;
  stateId: string | null = null;
  otherCityName: string | null = null;

  managerName: string = '';
  managerPhone: string = '';
  managerEmail: string = '';

  isGeoLocationEnabled: boolean = false;

  location: GeoLocation = new GeoLocation();

  companyIds: string[] = [];

  createDepartment: DepartmentCreate | null = null;
}


// =====================================
// DEPARTMENT
// Used both inside Branch and root level
// =====================================

export class DepartmentCreate {
  name: string = '';
  nameArabic: string = '';

  description: string = '';
  descriptionArabic: string = '';

  managerName: string = '';
  managerPhone: string = '';
  managerEmail: string = '';

  extension: string = '';
  location: string = '';

  branchIds: string[] = [];

  createTeam: TeamCreate | null = null;
}


// =====================================
// TEAM
// Used both inside Department and root level
// =====================================

export class TeamCreate {
  name: string = '';

  departmentIds: string[] = [];
}