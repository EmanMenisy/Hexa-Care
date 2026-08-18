import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  signal,
  SimpleChanges
} from '@angular/core';
import { MenuItem, SortMeta } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { TableLoadingComponent } from '../table-loading/table-loading';
import { DefaultCell } from '../default-cell/default-cell';
import { ButtonComponent } from '../../button/button';
import { ITableHeader } from '../../../../../../core/models/interface/ItableHeader';
import { Localization } from '../../../../../../core/services/localization/localization';
import { FeatureService } from '../../../../../../core/services/features/features';
import { TableHeaderType } from '../../../../../../core/models/enums/table-header-type';
import { Feature } from '../../../../../../core/models/enums/features';
import { DateCell } from "../date-cell/date-cell";
import { EnumCell } from "../enum-cell/enum-cell";
import { TranslatePipe } from '@ngx-translate/core';



@Component({
  selector: 'opus-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TableLoadingComponent,
    DefaultCell,
    TooltipModule,
    PaginatorModule,
    MenuModule,
    DateCell,
    EnumCell,
    TranslatePipe
],
  templateUrl: './table.html',
  styleUrls: ['./table.scss'],
})
export class Table implements OnInit, OnDestroy, OnChanges {
  @Input() data?: any[];
  @Input() columns: ITableHeader[] = [];
  @Input() pageSize: number = 10;
  @Input() pageNumber: number = 1;
  @Input() totalRecordsLength?: number;
  @Input() scrollHeight: string = '80vh';
  @Input() actions: MenuItem[] = [];
  @Input() multiSortMeta: SortMeta[] = [];
  @Input() canSelect: boolean = true;
  @Input() sortable: boolean = true;
  @Input() selectedRecords: any[] = [];
  @Input() alwaysShowPaginator: boolean = false;
  @Input() loading: boolean = true;
  @Input() paginationModuleTitle: string = '';
  @Input() isExpanded: boolean = false;
  @Input() showPaginationSkelton: boolean = true;

  @Output() selectedRecordsChanged: EventEmitter<any[]> = new EventEmitter<
    any[]
  >();
  @Output() sortChanged: EventEmitter<SortMeta[]> = new EventEmitter<
    SortMeta[]
  >();
  @Output() pageNumberChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() recordClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() actionToggle: EventEmitter<any> = new EventEmitter<any>();
  @Output() assignItemSelected = new EventEmitter<{
    row: any;
    index: number;
  }>();

  recordId: string = '';
  primaryColumn?: ITableHeader;
  pagesCount: string = '';
  columnsLength: number = 0;
  firstIndex: number = 0;
  sortMenu: MenuItem[] = [];
  bulkMenuItems:MenuItem[]=[];
  currentLang = signal<string | null>('')
  TableHeaderType = TableHeaderType;
  localizationServiceSubscription?: Subscription;
  assignItemsMenu: MenuItem[] = [];
  constructor(public readonly localizationService: Localization, private readonly featureService: FeatureService) {
    // This is intentional
  }
  ASSIGN_MENU_CONFIG: any[] = [];
  ngOnInit(): void {
      this.currentLang.set(this.localizationService.selectedLang());

    this.localizationService
      .getTranslate('customComponents.table.showing')
      .subscribe(() => {
        this.getPageCountString();
      });

    this.localizationServiceSubscription = this.localizationService
      .onLangChange()
      .subscribe((res: any) => {
        this.currentLang.set(res.lang); 
        this.getPageCountString();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns'] && changes['columns'].currentValue) {
      this.getRecordId();
      this.getPrimaryColumn();
      this.getColumnsLength();
    }
    if (!changes['data']?.firstChange && changes['data']?.currentValue)
      this.resetScrolling();
    if (changes['pageNumber']?.currentValue) this.setFirstIndex();
    if (this.isExpanded) this.data?.forEach((row) => (row.isExpanded = true));
  }

  ngOnDestroy(): void {
    this.localizationServiceSubscription?.unsubscribe();
  }

  /**
   * @description To emit the page info to the parent component
   * @param event { first: number; rows: number }
   * event.first: Index of first record in page
   * event.rows: Number of rows on the page
   */
  onPageChange(event: { first: number; rows: number }): void {
    let pageNumber = event.first / event.rows + 1;
    this.pageNumberChange.emit(pageNumber);
  }

  /**
   * @description to reset the scrolling in table view when data table changes
   **/
  resetScrolling(): void {
    requestAnimationFrame(() => {
      document.getElementsByClassName('p-datatable-wrapper')[0].scrollTop = 0;
    });
  }

  /**
   * To emit the selected rows to the parent component
   */
  onSelectionChange(): void {
    this.selectedRecordsChanged.emit(this.selectedRecords);
  }

  onSort(event: { multisortmeta: SortMeta[] }): void {
    this.sortChanged.emit(event.multisortmeta);
  }

  onSelectAllClicked(selected: boolean): void {
    if (selected) this.selectedRecords = this.data || [];
    else this.selectedRecords = [];
    this.onSelectionChange();
  }

  toggleActionMenu(menu: any, event: any, rowData: any): void {
    this.actionToggle.emit(rowData);
    menu.toggle(event);
  }

  onShowMenu(recordData: any): void {
    if (recordData.id)
      this.actions.forEach((action) => (action.id = recordData.id));
  }

  /**
   * @returns the primary name of the row
   */
  getRecordId(): void {
    this.recordId = this.columns.find((col) => col.recordKey)?.field || '';
  }
  /**
   * @returns the primary name of the row
   */
  getPrimaryColumn(): void {
    this.primaryColumn = this.columns.find((col) => col.isPrimary);
  }

  getColumnsLength(): void {
    this.columnsLength = this.columns.filter((col) => !col.hidden).length;
  }

   onTitleClicked(recordData: any, column: ITableHeader): void {
    if (!column.isClickable) return;
    this.recordClicked.emit(recordData);
   }

  /**
   * To get the pages cont string displaying the current page and total pages
   */
  getPageCountString(): void {
    this.pagesCount = `${this.localizationService.instant('shared.showing')} {first}  ${this.localizationService.instant('shared.to')} {last} ${this.localizationService.instant('shared.of')} {totalRecords} ${this.paginationModuleTitle}`;
  }

  /**
   * To set first index on page change
   */
  setFirstIndex(): void {
    this.firstIndex = (this.pageNumber - 1) * this.pageSize;
  }

 
  onActionClick(rowData: any, actionLabel: string): void {
    this.actionToggle.emit(rowData);
    this.actions
      .find((action) => action['label'] === actionLabel)
      ?.command!(rowData);
  }

  /**
   * this simple function created for tracking elements in controls categories list
   * @param index, index of every item in list
   * @returns returns index identifier for this element.
   */
  trackByIndex(index: number): number {
    return index;
  }
  hasVisibleActions(): boolean {
    return this.actions?.some((action) => action.visible) || false;
  }

  onAssignItemSelected(rowData: any, index: number): void {
    this.assignItemSelected.emit({
      row: rowData,
      index: index,
    });
  }

  expand(rowData: any) {
    rowData.expanded = !rowData.expanded
  }
}
