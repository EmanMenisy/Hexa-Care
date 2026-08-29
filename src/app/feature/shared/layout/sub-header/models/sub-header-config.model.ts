import { ButtonSeverity } from "primeng/button";

export interface HeaderMenuItem {
  label?: string;
  icon?: string;
  action?: string;
  route?: string;
  feature?: number;
  items?: HeaderMenuItem[];
}

export interface PageHeaderConfig {
  icon: string;
  title: string;
  subtitle: string;
  tabs?: { label: string; route: string }[];
  subTabs?: {
    label: string;
    route: string;
    visible?: boolean;
  }[];
  buttons?: {
    label?: string;
    icon?: string;
    severity?: ButtonSeverity;
    type?: 'group' | 'toggle' | 'back';
    route?: string;
    action?: string;
    feature?: number;
    showOnRoute?: string;
    groupButtons?: { label: string; icon: string; route: string }[];
    tabs?: { label: string; route: string }[];

    menuItems?: HeaderMenuItem[];

    toggleStates?: { label?: string; icon?: string; value: any }[];
    defaultState?: any;
    currentState?: { label?: string; icon?: string; value: any };
  }[];
}