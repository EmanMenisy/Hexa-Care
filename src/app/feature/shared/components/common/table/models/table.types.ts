import { ITableHeader } from "../../../../../../core/models/interface/ItableHeader";

/**
 * ===== Sorting =====
 */
export type SortOrder = 'asc' | 'desc' | null;

export interface ISortEvent {
  field: string;
  isAscending: boolean;
}

/**
 * Extend the shared ITableHeader with the extra bits the native table needs.
 * If you'd rather not keep this extension around, just add `sortable?: boolean`
 * directly to ITableHeader in the shared models and drop this type.
 */
export interface INativeTableColumn extends ITableHeader {
  /** Defaults to true. Set false to disable sorting on this specific column. */
  sortable?: boolean;
}

/**
 * ===== Generic row actions =====
 *
 * Replaces the old "one isActionHasX() method per label" approach.
 * You describe *what* the action looks like (type) and *when* it's visible,
 * the table takes care of rendering + hiding empty header/column.
 */
export type NativeTableActionType =
  | 'icon' // <em class="icon pointer">  (default)
  | 'button' // <button><em/><span>label</span></button>
  | 'badge' // <span class="badge">label</span>
  | 'link' // <a>label</a>
  | 'toggle' // button whose label flips based on a row field (e.g. Paid/Unpaid)
  | 'menu'; // "..." icon that opens a p-menu popup built from children

export interface ITableAction {
  /** Unique, stable identifier. Passed back via (actionToggle)/(click) instead of matching on the translated label. */
  key: string;

  /** Translation key (or plain text) shown for badge/link/button/toggle types. */
  label?: string;

  /** Icon class, e.g. 'opus-icon-edit-02' or 'pi pi-trash'. */
  icon?: string;

  /** Called with a PrimeNG-style command event when the action is triggered. */
  command?: (event?: { originalEvent?: Event; item?: ITableAction }) => void;

  disabled?: boolean;
  styleClass?: string;
  id?: string;

  /** Visual style. Defaults to 'icon'. */
  type?: NativeTableActionType;

  /**
   * Whether the action shows up at all.
   * - omitted -> true (visible by default)
   * - boolean -> static visibility
   * - function -> evaluated per row, e.g. (row) => row.status === 'Active'
   */
  visible?: boolean | ((row: any) => boolean);

  /** Extra CSS class(es) applied to the rendered element, e.g. 'color-error' for delete. */
  cssClass?: string;

  /**
   * Per-row gate that doesn't hide the action slot entirely but swaps it for
   * `emptyPlaceholder` when false (mirrors the old "Fix Issues" / "Image" columns
   * that show '--' when the row doesn't qualify).
   */
  condition?: (row: any) => boolean;
  emptyPlaceholder?: string; // shown when `condition` is false. Defaults to '--'.

  /** type: 'toggle' — boolean field on the row that decides which label to show. */
  toggleField?: string;
  /** type: 'toggle' — label shown when the toggle field is falsy (i.e. the action to turn it on). */
  activeLabel?: string;
  /** type: 'toggle' — label shown when the toggle field is truthy. */
  inactiveLabel?: string;

  /**
   * type: 'menu' — build the popup items dynamically for this row.
   * Runs on click, so it can read fresh row state.
   * Takes priority over `items` when both are provided.
   */
  buildChildren?: (row: any) => ITableAction[];

  /**
   * type: 'menu' — static list of children when they don't depend on the row.
   * Ignored if `buildChildren` is provided.
   */
  items?: ITableAction[];
}