export interface SidebarItem {
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
   * Page code. When `pageCode === code`, the module IS the page:
   * clicking it navigates directly instead of expanding
   * (e.g. "الرئيسية" in your screenshot — no chevron, single link).
   */
  pageCode?: number;

  /**
   * Sub-pages under this module. Ignored/hidden when the item is a
   * "single page" (pageCode === code) even if you pass children by mistake.
   */
  children?: SidebarItem[];

  /**
   * Section header shown ABOVE this item, e.g. "Facility & structure".
   * Only set it on the first item of a new section — the rest of the
   * items in that section just leave it undefined.
   */
  description?: string;
}
