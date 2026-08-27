export interface ISidebarItem {
  /** Unique id — used for expand/collapse state & @for tracking */
  id: string;

  /** Label shown next to the icon */
  label: string;

  /** Icon (emoji, icon-font class... whatever your project uses) */
  icon?: string;

  /** Route this item (or its children) navigates to */
  route?: string;

  /** Module code */
  code: number;

  /**
   * Optional — the backend page code this item maps to, if you need it
   * for anything else (analytics, deep links...). No longer used to
   * decide single-page behavior — see `standalone` below.
   */
  pageCode?: number;

  /**
   * Explicit switch: true → this item is always rendered as a direct
   * link (icon + label, no chevron, no dropdown), even if `children`
   * is populated. false/undefined → normal module behavior: expands
   * to show children when clicked.
   *
   * Example: a "Main"/"الرئيسية" entry that should just navigate,
   * not expand:
   *   { id: 'main', label: 'Main', icon: '🏠', code: 1, route: '/main', standalone: true }
   */
  standalone?: boolean;

  /**
   * Sub-pages under this module. Ignored/hidden when `standalone` is true,
   * even if you pass children by mistake.
   */
  children?: ISidebarItem[];

  /**
   * Section header shown ABOVE this item, e.g. "Facility & structure".
   * Only set it on the first item of a new section — the rest of the
   * items in that section just leave it undefined.
   */
  description?: string;
}