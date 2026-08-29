import { Localization } from './../../../../../core/services/localization/localization';
import { CommonModule } from '@angular/common';
import {
  Component,
  TemplateRef,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MenuModule } from 'primeng/menu';

import {
  INativeTableColumn,
  ISortEvent,
  ITableAction,
  SortOrder,
} from './models/table.types';
import { TranslatePipe } from '@ngx-translate/core';
import { NativeTableColumnTemplateDirective } from './directives/native-table-column-template.directive';
import { TableHeaderType } from '../../../../../core/models/enums/table-header-type';
import { NativeDataCell } from './partials/native-data-cell/native-data-cell';
import { NativeDefaultCell } from './partials/native-default-cell/native-default-cell';
import { NativeEnumCell } from './partials/native-enum-cell/native-enum-cell';
import { NativeTableLoading } from './partials/native-table-loading/native-table-loading';
import { NativeListCell } from './partials/native-list-cell/native-list-cell';
import { TooltipModule } from 'primeng/tooltip';



@Component({
  selector: 'app-table',
  imports: [
    CommonModule,
    TranslatePipe,
    MenuModule,
    NativeDataCell,
    NativeDefaultCell,
    NativeEnumCell,
    NativeTableLoading,
    NativeListCell,
    TooltipModule
  ],
  templateUrl: './table.html',
  styleUrl: './table.scss',
})
export class Table {
  private readonly localizationService = inject(Localization);

  // ===== Inputs =====
  data = input<any[]>();
  columns = input<INativeTableColumn[]>([]);
  pageSize = input<number>(10);
  totalRecordsLength = input<number>();
  scrollHeight = input<string>('80vh');
  actions = input<ITableAction[]>([]);
  canSelect = input<boolean>(true);
  selectedRecords = input<any[]>([]);
  alwaysShowPaginator = input<boolean>(false);
  loading = input<boolean>(true);
  paginationModuleTitle = input<string>('');
  isExpanded = input<boolean>(false);
  bordered = input<boolean>(false);

  sortField = input<string>();
  sortOrder = input<boolean | null>(null);

  // ===== Two-way (banana-in-a-box: [(pageNumber)]) =====
  pageNumber = model<number>(1);

  // ===== Outputs =====
  selectedRecordsChanged = output<any[]>();
  sortChanged = output<ISortEvent>();
  recordClicked = output<any>();
  actionToggle = output<any>();

  actionClicked = output<{ action: string; row: any }>();

  // ===== Content projection: custom per-column templates =====
  private columnTemplateRefs = contentChildren(NativeTableColumnTemplateDirective);
  columnTemplateMap = computed<Record<string, TemplateRef<any>>>(() => {
    const map: Record<string, TemplateRef<any>> = {};
    this.columnTemplateRefs().forEach((t) => (map[t.field()] = t.templateRef));
    return map;
  });

  // ===== Localization =====
  private langChange = toSignal(this.localizationService.onLangChange(), {
    initialValue: undefined,
  });
  currentLang = computed(
    () => this.langChange()?.lang ?? this.localizationService.selectedLang(),
  );

  // ===== Derived column info =====
  recordId = computed(() => this.columns().find((c) => c.recordKey)?.field || '');
  primaryColumn = computed(() => this.columns().find((c) => c.isPrimary));
  columnsLength = computed(() => this.columns().filter((c) => !c.hidden).length);

  TableHeaderType = TableHeaderType;

  genericMenuItems = signal<any[]>([]);

  constructor() {
    effect(() => {
      if (this.isExpanded()) {
        this.data()?.forEach((row) => (row.isExpanded = true));
      }
    });
  }

  // ===== Pagination (lazy) =====
  totalPages = computed(() =>
    Math.max(1, Math.ceil((this.totalRecordsLength() ?? 0) / this.pageSize())),
  );

  pageReportText = computed(() => {
    const total = this.totalRecordsLength() ?? 0;
    const pageSize = this.pageSize();
    const pageNumber = this.pageNumber();
    const first = total === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
    const last = Math.min(pageNumber * pageSize, total);
    return `${this.localizationService.instant('shared.showing')} ${first} ${this.localizationService.instant('shared.to')} ${last} ${this.localizationService.instant('shared.of')} ${total} ${this.paginationModuleTitle()}`.trim();
  });

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.pageNumber();
    const windowSize = 5;

    let start = Math.max(1, current - Math.floor(windowSize / 2));
    let end = Math.min(total, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);

    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  });

  goToPage(page: number): void {
    const p = Math.max(1, Math.min(this.totalPages(), page));
    if (p === this.pageNumber()) return;
    this.pageNumber.set(p);
  }

  prevPage(): void {
    this.goToPage(this.pageNumber() - 1);
  }

  nextPage(): void {
    this.goToPage(this.pageNumber() + 1);
  }

  goToFirst(): void {
    this.goToPage(1);
  }

  goToLast(): void {
    this.goToPage(this.totalPages());
  }

  // ===== Sorting (single column, backend-driven, boolean) =====
  isColumnSortable(col: INativeTableColumn): boolean {
    return !col.hidden && col.sortable === true && !!col.field;
  }

  onHeaderClick(col: INativeTableColumn): void {
    if (!this.isColumnSortable(col)) return;
    const field = col.field as string;
    const currentField = this.sortField();
    const currentAscending = this.sortOrder();

    const nextAscending = currentField !== field ? true : !currentAscending;

    this.sortChanged.emit({ field, isAscending: nextAscending });
  }

  getSortDir(field?: string): SortOrder {
    if (!field || this.sortField() !== field) return null;
    return this.sortOrder() ? 'asc' : 'desc';
  }

  isSortActive(field?: string): boolean {
    return !!field && this.sortField() === field;
  }

  // ===== Selection =====
  isRowSelected(row: any): boolean {
    const key = this.recordId();
    const selected = this.selectedRecords();
    if (!key) return selected.includes(row);
    return selected.some((r) => r?.[key] === row?.[key]);
  }

  toggleRowSelection(row: any, checked: boolean): void {
    const key = this.recordId();
    const current = this.selectedRecords();

    const next = checked
      ? this.isRowSelected(row)
        ? current
        : [...current, row]
      : current.filter((r) => (key ? r?.[key] !== row?.[key] : r !== row));

    this.selectedRecordsChanged.emit(next);
  }

  isAllPageSelected(): boolean {
    const rows = this.data() ?? [];
    if (!rows.length) return false;
    return rows.every((r) => this.isRowSelected(r));
  }

  onSelectAllClicked(selected: boolean): void {
    const rows = this.data() ?? [];
    const key = this.recordId();
    const current = this.selectedRecords();
    let next: any[];

    if (selected) {
      if (!key) {
        next = rows.slice();
      } else {
        const map = new Map<any, any>();
        [...current, ...rows].forEach((r) => map.set(r?.[key], r));
        next = Array.from(map.values());
      }
    } else if (!key) {
      next = [];
    } else {
      const ids = new Set(rows.map((r) => r?.[key]));
      next = current.filter((r) => !ids.has(r?.[key]));
    }

    this.selectedRecordsChanged.emit(next);
  }

  // ===== title click (per-cell "isClickable") =====
  onTitleClicked(recordData: any, column: INativeTableColumn): void {
    if (!column.isClickable) return;
    this.recordClicked.emit(recordData);
  }

  // ===== helpers =====
  getColumnTemplate(field?: string): TemplateRef<any> | null {
    if (!field) return null;
    return this.columnTemplateMap()[field] ?? null;
  }

  trackByKey(index: number, action: ITableAction): string {
    return action.key ?? String(index);
  }
  getCellTooltip(row: any, col: INativeTableColumn): string | null {
  if (col.tooltip) {
    const value = row?.[col.tooltip];
    return value != null ? String(value) : null;
  }
  const value = row?.[col.field as string];
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  return null;
}

  // ===== Generic row actions =====
  private isVisible(action: ITableAction, row?: any): boolean {
    const visible = action.visible;
    if (visible === undefined) return true;
    return typeof visible === 'function' ? !!visible(row) : !!visible;
  }

  rowActions(row: any): ITableAction[] {
    return (this.actions() || []).filter((a) => this.isVisible(a, row));
  }

  meetsCondition(action: ITableAction, row: any): boolean {
    return !action.condition || action.condition(row);
  }

  hasVisibleActions(): boolean {
    const actions = this.actions();
    const rows = this.data();
    if (!actions?.length || !rows?.length) return false;
    return rows.some((row) =>
      this.rowActions(row).some((a) => this.meetsCondition(a, row)),
    );
  }

  getToggleLabel(action: ITableAction, row: any): string {
    const isOn = action.toggleField ? !!row?.[action.toggleField] : false;
    const key = isOn ? action.inactiveLabel : action.activeLabel;
    return key ? this.localizationService.instant(key) : (action.label ?? '');
  }

  private findAction(actionKey: string, actions: ITableAction[] = this.actions()): ITableAction | undefined {
    for (const action of actions) {
      if (action.key === actionKey) return action;
      const children = action.items;
      if (children?.length) {
        const found = this.findAction(actionKey, children);
        if (found) return found;
      }
    }
    return undefined;
  }

  onActionClick(rowData: any, actionKey: string): void {
    this.actionToggle.emit(rowData);
    this.actionClicked.emit({ action: actionKey, row: rowData });

    const found = this.findAction(actionKey);
    found?.command?.({ originalEvent: undefined, item: found });
  }

  toggleGenericMenu(menu: any, event: Event, rowData: any, action: ITableAction): void {
    const children = action.buildChildren
      ? action.buildChildren(rowData)
      : (action.items ?? []);

    this.genericMenuItems.set(
      children
        .filter((child) => this.isVisible(child, rowData) && this.meetsCondition(child, rowData))
        .map((child) => ({
          label: child.label ? this.localizationService.instant(child.label as string) : undefined,
          icon: child.icon,
          command: () => this.onActionClick(rowData, child.key),
        })),
    );

    menu.toggle(event);
  }
}