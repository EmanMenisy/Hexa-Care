export interface Feature {
  id: string;
  name: string;
  nameArabic: string;
  description: string;
  descriptionArabic: string;
  isAllowed: boolean;
  featureCode: number;
  actionType: string;
  isSystemFeature: boolean;
  pageId: string;
  pageName: string;
  moduleId: string;
  moduleName: string;
}

export interface Page {
  pageId: string;
  pageName: string;
  isAllowed: boolean;
  isOpen:boolean;
  features: Feature[];
}

export interface ModulePermission {
  moduleId: string;
  moduleName: string;
  isAllowed: boolean;
  pages: Page[];
}