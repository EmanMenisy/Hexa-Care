// organization-profile.models.ts

export type ProfileMode = 'view' | 'edit';

export interface KpiItem {
  label: string;
  value: number | string;
  icon: string;
  iconBg: string;
  trend?: string;
  trendLabel?: string;
}

export interface BasicData {
  nameAr: string;
  nameEn: string;
  commercialRegister: string;
  taxNumber: string;
  licenseNumber: string;
  currency: string;
}

export interface ContactData {
  address: string;
  city: string;
  country: string;
  phone1: string;
  phone2: string;
  fax: string;
  email: string;
  website: string;
}

export interface Administration {
  hospitalManager: string;
  managerPhone: string;
  managerEmail: string;
  medicalDirector: string;
}

export interface OrganizationProfileData {
  basicData: BasicData;
  contactData: ContactData;
  administration: Administration;
  logoUrl:string;
}

export const ORG_PROFILE_ACTIONS = {
  EDIT: 'edit',
  CANCEL: 'cancel',
  SAVE: 'save',
} as const;



export const MOCK_PROFILE_DATA: OrganizationProfileData = {
  basicData: {
    nameAr: 'مستشفى الأمل التخصصي',
    nameEn: 'Al-Amal Specialized Hospital',
    commercialRegister: '1010123456',
    taxNumber: '300012345600003',
    licenseNumber: 'LIC-998877',
    currency: 'SAR',
  },
  contactData: {
    address: ' طريق الملك فهد، حي الصحافة',
    city: 'الرياض',
    country: 'المملكة العربية السعودية',
    phone1: '+966112345678',
    phone2: '+966112345679',
    fax: '+966112345670',
    email: 'info@alamal-hospital.com',
    website: 'https://alamal-hospital.com',
  },
  administration: {
    hospitalManager: 'د. خالد عبد الرحمن',
    managerPhone: '+966500112233',
    managerEmail: 'k.manager@alamal-hospital.com',
    medicalDirector: 'د. سارة التميمي',
  },
  logoUrl: 'https://primefaces.org/cdn/primeng/images/galleria/galleria1.jpg',
};
export type CapacityCategory = 'criticalCare' | 'operations' | 'clinics' | 'equipment';

export interface CapacityCategoryInfo {
  key: CapacityCategory;
  label: string;
  icon: string;
}

export interface CapacityItem {
  id: string;
  rank: number;
  itemName: string;
  category: CapacityCategoryInfo;
  classification: string | null;
  count: number;
  unit: string;
  isActive: boolean;
}

// icon/label config for the category badge template
export const CAPACITY_CATEGORY_MAP: Record<CapacityCategory, CapacityCategoryInfo> = {
  criticalCare: { key: 'criticalCare', label: 'Critical care', icon: 'pi pi-heart-fill' },
  operations: { key: 'operations', label: 'Operations', icon: 'pi pi-briefcase' },
  clinics: { key: 'clinics', label: 'Clinics', icon: 'pi pi-shield' },
  equipment: { key: 'equipment', label: 'Equipment', icon: 'pi pi-cog' },
};

export const MOCK_CAPACITY_DATA: CapacityItem[] = [
  {
    id: '3',
    rank: 3,
    itemName: 'ICU beds',
    category: CAPACITY_CATEGORY_MAP.criticalCare,
    classification: 'Class A',
    count: 14,
    unit: 'سرير',
    isActive: true,
  },
  {
    id: '4',
    rank: 4,
    itemName: 'Intermediate care beds',
    category: CAPACITY_CATEGORY_MAP.criticalCare,
    classification: null,
    count: 10,
    unit: 'سرير',
    isActive: true,
  },
  {
    id: '5',
    rank: 5,
    itemName: 'Incubators',
    category: CAPACITY_CATEGORY_MAP.criticalCare,
    classification: null,
    count: 8,
    unit: 'حضانة',
    isActive: true,
  },
  {
    id: '2',
    rank: 2,
    itemName: 'Operation rooms',
    category: CAPACITY_CATEGORY_MAP.operations,
    classification: 'Class A',
    count: 6,
    unit: 'غرفة',
    isActive: true,
  },
  {
    id: '7',
    rank: 7,
    itemName: 'Outpatient clinics',
    category: CAPACITY_CATEGORY_MAP.clinics,
    classification: null,
    count: 12,
    unit: 'عيادة',
    isActive: true,
  },
  {
    id: '8',
    rank: 8,
    itemName: 'CT scanners',
    category: CAPACITY_CATEGORY_MAP.equipment,
    classification: null,
    count: 2,
    unit: 'جهاز',
    isActive: true,
  },
  {
    id: '9',
    rank: 9,
    itemName: 'MRI machines',
    category: CAPACITY_CATEGORY_MAP.equipment,
    classification: null,
    count: 1,
    unit: 'جهاز',
    isActive: true,
  },
];
