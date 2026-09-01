import { ISidebarItem } from './sidebarItem.model';

// Built from the backend "modules" payload (module.code / page.code).
// Grouped into sections for the UI — move `description` around freely
// if you want the modules organized differently.
export const SIDEBAR_MENU: ISidebarItem[] = [
  // ── Facility & structure ──────────────────────────────
  {
    id: 'organization',
    label: 'Hospital',
    icon: '🏢',
    code: 1,
    description: 'organization structure',
    children: [
      { id: 'org-companies', label: 'Company Profile', icon: '🏬', route: '/organizationProfile', code: 200 },
      { id: 'org-companies', label: 'Companies', icon: '🏬', route: '/company', code: 200 },
      { id: 'org-branches', label: 'Branches', icon: '📍', route: '/branch', code: 1900 },
      { id: 'org-departments', label: 'Departments', icon: '🗂️', route: '/department', code: 1700 },
      { id: 'org-teams', label: 'Teams', icon: '👥', route: '/team', code: 500 },
      // { id: 'org-facility', label: 'Facility', icon: '🏗️', route: '/facility', code: 600 },
      // { id: 'org-organizations', label: 'Organizations', icon: '🏛️', route: '/organizations', code: 1600 },
    ],
  },
  {
    id: 'Organizational Structure ',
    label: 'Organizational Structure',
    icon: '🏬',
    code: 2,
    description: 'organization structure',
    children: [
      { id: 'org-companies', label: 'staff Member', icon: '🏬', route: '/home', code: 700 },
      { id: 'Doctors', label: 'Doctors', icon: '🏬', route: '/doctors', code: 2400},
    ],
  },

  // // ── Care ───────────────────────────────────────────────
  // {
  //   id: 'patients',
  //   label: 'Patients',
  //   icon: '🧑‍🤝‍🧑',
  //   code: 9,
  //   description: 'Care',
  //   children: [
  //     { id: 'patients-list', label:  'Patients', icon: '🧍', route: '/patients/list', code: 900 },
  //     { id: 'patients-memberships', label: 'Memberships', icon: '💳', route: '/patients/memberships', code: 2100 },
  //   ],
  // },
  // {
  //   id: 'care',
  //   label: 'Care',
  //   icon: '🩺',
  //   code: 7,
  //   children: [
  //     { id: 'care-consultations', label: 'Consultations', icon: '💬', route: '/care/consultations', code: 2000 },
  //     { id: 'care-appointments', label: 'Appointments', icon: '📅', route: '/care/appointments', code: 1300 },
  //   ],
  // },
  // {
  //   id: 'workforce',
  //   label: 'Workforce',
  //   icon: '👨‍⚕️',
  //   code: 2,
  //   children: [
  //     { id: 'workforce-doctors', label: 'Doctors', icon: '🩺', route: '/workforce/doctors', code: 2400 },
  //     { id: 'workforce-staff', label: 'Staff', icon: '🧑‍💼', route: '/workforce/staff', code: 700 },
  //   ],
  // },

  // // ── Revenue & insurance ────────────────────────────────
  // {
  //   id: 'revenue',
  //   label: 'Revenue',
  //   icon: '💰',
  //   code: 6,
  //   description: 'Revenue & insurance',
  //   children: [
  //     { id: 'revenue-visits', label: 'Visits', icon: '🚶', route: '/revenue/visits', code: 800 },
  //     { id: 'revenue-services-pricing', label: 'Services & pricing', icon: '🏷️', route: '/revenue/services-pricing', code: 400 },
  //     { id: 'revenue-payments', label: 'Payments', icon: '💳', route: '/revenue/payments', code: 2200 },
  //   ],
  // },
  // {
  //   id: 'insurance-contracting',
  //   label: 'Insurance & contracting',
  //   icon: '🤝',
  //   code: 4,
  //   children: [
  //     { id: 'insurance-claims', label: 'Claims', icon: '📄', route: '/insurance-contracting/claims', code: 2500 },
  //     { id: 'insurance-payers', label: 'Payers & insurance', icon: '🛡️', route: '/insurance-contracting/payers-insurance', code: 300 },
  //     { id: 'insurance-approvals', label: 'Approvals', icon: '✅', route: '/insurance-contracting/approvals', code: 1200 },
  //     { id: 'insurance-contracts', label: 'Contracts', icon: '📑', route: '/insurance-contracting/contracts', code: 1100 },
  //   ],
  // },

  // // ── System ─────────────────────────────────────────────
  // {
  //   id: 'communications',
  //   label: 'Communications',
  //   icon: '🔔',
  //   code: 5,
  //   description: 'System',
  //   children: [
  //     { id: 'comm-notifications', label: 'Notifications', icon: '🔔', route: '/communications/notifications', code: 1000 },
  //     { id: 'comm-alerts', label: 'Alerts', icon: '⚠️', route: '/communications/alerts', code: 1500 },
  //   ],
  // },
  // {
  //   id: 'documents',
  //   label: 'Documents',
  //   icon: '📎',
  //   code: 3,
  //   standalone: true,
  //   children: [
  //     { id: 'documents-attachments', label: 'Attachments', icon: '📎', route: '/layout/premissions', code: 100 },
  //   ],
  // },
  // {
  //   id: 'insights',
  //   label: 'Insights',
  //   icon: '📊',
  //   code: 8,
  //   children: [
  //     { id: 'insights-reports', label: 'Reports', icon: '📈', route: '/insights/reports', code: 1400 },
  //   ],
  // },
  // {
  //   id: 'administration',
  //   label: 'Administration',
  //   icon: '⚙️',
  //   code: 10,
  //   children: [
  //     { id: 'admin-settings', label: 'Settings', icon: '🛠️', route: '/administration/settings', code: 2300 },
  //     { id: 'admin-users', label: 'Administration', icon: '🔐', route: '/administration/users', code: 1800 },
  //   ],
  // },
];