import { ButtonSeverity } from 'primeng/button';

export interface HeaderMenuItem {
  label?: string;
  icon?: string;
  action?: string;
  route?: string;
  visible?: boolean;
  disabled?: boolean;
  items?: HeaderMenuItem[];
}

export interface HeaderTab {
  label: string;
  route: string;
  visible?: boolean;
}

export interface HeaderButton {
  label?: string;
  icon?: string;
  severity?: ButtonSeverity;
  type?: 'group' | 'toggle' | 'back';
  route?: string;
  action?: string;

  visible?: boolean;
  disabled?: boolean;
  showOnRoute?: string;

  groupButtons?: { label: string; icon: string; route: string }[];
  tabs?: HeaderTab[];

  menuItems?: HeaderMenuItem[];

  toggleStates?: { label?: string; icon?: string; value: any }[];
  defaultState?: any;
  currentState?: { label?: string; icon?: string; value: any };
}


export interface PageHeaderConfig {
  icon?: string;
  title?: string;
  subtitle?: string;
  tabs?: HeaderTab[];
  subTabs?: HeaderTab[];
  buttons?: HeaderButton[];
}