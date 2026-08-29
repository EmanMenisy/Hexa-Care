import { Component, OnInit, signal } from '@angular/core';
import { InputTextComponent } from '../../../shared/components/primeng/input-text/input-text';
import {  TranslatePipe } from '@ngx-translate/core';
import { Table } from '../../../shared/components/common/table/table';
import { ButtonComponent } from "../../../shared/components/primeng/button/button";
import { ITableHeader } from '../../../../core/models/interface/ItableHeader';
import { ISortEvent, ITableAction } from '../../../shared/components/common/table/models/table.types';
import { HeaderActionService } from '../../../shared/layout/sub-header/services/header-action.service';
import { TableHeaderType } from '../../../../core/models/enums/table-header-type';
import { Organization } from '../../services/organization';
import { ApiStatus } from '../../../../core/models/enums/api-status';
import { FilterService } from '../../../../core/services/filter/filter';
import { EmptyState } from '../../../shared/components/common/empty-state/empty-state';
import { NotFound } from '../../../shared/components/common/not-found/not-found';
import { HierarchySteps } from '../../models/organization-creation.model';
import { OrganizationLogic } from '../../services/organization-logic';
import { OrganizationManual } from '../../partials/organization-manual/organization-manual';

@Component({
  selector: 'app-branch',
  imports: [InputTextComponent, TranslatePipe, Table, ButtonComponent,EmptyState,NotFound,OrganizationManual],
  templateUrl: './branch.html',
  styleUrl: './branch.scss',
})
export class Branch {
  //====================Table
  tableColumns: ITableHeader[] = [];
  tableActions: ITableAction[] = [];
  activeSortField?: string;
  activeSortAscending: boolean | null = null;
  totalRecordsLength: number = 0;
  //====================Manual
  isManualSidebarVisible = signal(false);
  selectedItem = signal<any>(null);
  //====================List and Payload
  list = signal<any[]>([]);
  payload: any = {
    pageNumber: 1,
    pageSize: 10,
    name: '',
  };
  isFilterApplied = signal(false);
  //====================ApiStatus
  PageStatus = ApiStatus;
  pageStatus: ApiStatus = ApiStatus.Loading;
  //====================Constructor
  constructor(
    private readonly HeaderActionService:HeaderActionService,
    private readonly organizationService:Organization,
    private readonly filterService:FilterService,
    private readonly organizationLogicService:OrganizationLogic,
  ){}
   ngOnInit(): void {
    this.HeaderActionService.action$.subscribe((res)=>{
      if(res=='create'){
        this.openManualSideBar();
      }
    })
    this.getTableActions();
    this.getTableColumns();
    this.getAllList();
  }
  //====================Table configurations
  getTableColumns(): void {
    this.tableColumns = [
      {
        field: 'name',
        name: 'organization.branch.table.name',
        type: TableHeaderType.String,
        sortable: false
      },
      {
        field: 'cityName',
        name: 'organization.branch.table.cityName',
        type: TableHeaderType.String,
      },
      {
        field: 'companyName',
        name: 'organization.branch.table.companyName',
        type: TableHeaderType.String,
      },
      {
        field: 'createdAt',
        name: 'organization.branch.table.createdAt',
        type: TableHeaderType.Date,
      },
    ] as ITableHeader[];
  }
  getTableActions(): void {
    this.tableActions = [
      {
        key: 'menuItems',
        type: 'menu',
        icon: 'pi pi-ellipsis-v',
        visible: true,
        items: [
          {
            key: 'edit',
            label: 'buttons.edit',
            icon: 'pi pi-pencil',
            visible: true,
          },
          {
            key: 'delete',
            label: 'buttons.delete',
            icon: 'pi pi-trash',
            visible: true,
          },
        ],
      },
    ];
  }
  onTableAction(event: { action: string; row: any }): void {
    switch (event.action) {
      case 'edit':
        this.onEdit(event.row);
        break;
      case 'delete':
        this.onDelete(event.row.id);
        break;
    }
  }
  onSortChanged(event: ISortEvent): void {
    this.activeSortField = event.field;
    this.activeSortAscending = event.isAscending;
    this.payload = {
      ...this.payload,
      sortBy: event.field,
      isAscending: event.isAscending,
    } as any;
      this.getAllList();
  }
  //====================Get List
  getAllList(pageNumber=1){
    this.pageStatus = ApiStatus.Loading;
    this.payload = {
      ...this.payload,
      pageNumber: pageNumber
    };
    const request = this.filterService.cleanRequest(this.payload);
    this.isFilterApplied.set(this.hasFilters());
    this.organizationService.getBranches(request).subscribe({
      next:(res)=>{
        this.list.set(res.items);
        this.pageStatus = ApiStatus.Success;
        this.totalRecordsLength = res.records;
      },
      error:(err)=>{
        this.pageStatus = ApiStatus.Error;
      }
    })
  }
  //====================Has Filter
  hasFilters(): boolean {
    return !!(
      this.payload.name?.trim()
    );
  }
  //====================Manual
  openManualSideBar(){
     this.organizationLogicService.setId(null);
     this.organizationLogicService.setStart(HierarchySteps.Branch);
     this.isManualSidebarVisible.set(true);
   }
   closeManual(){
     this.isManualSidebarVisible.set(false);
   }
   onSaveItem(){
     this.isManualSidebarVisible.set(false);
     this.getAllList(this.payload.pageNumber);
   }
  //====================edit
  onEdit(id: string) {
    this.organizationService.getBranchById(id).subscribe({
      next: (res) => {
        this.selectedItem = res;
        this.isManualSidebarVisible.set(true);
      },
    });
  }
  //====================Delete
  onDelete(roleId: string) {
    this.organizationService.deleteBranch(roleId).subscribe({
      next: (res) => {
        this.getAllList();
      },
      error: (err) => {

      }
    });
  }
}
