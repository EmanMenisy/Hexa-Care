import { HeaderActionService } from './../../../shared/layout/sub-header/services/header-action.service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ManualRole } from "../partials/manual-role/manual-role";
import { LoginService } from '../../../Login/service/login';
import { Roleservice } from '../service/roleservice';
import { ApiStatus } from '../../../../core/models/enums/api-status';
import { GetRoleRequest, RoleFilters, RoleResponse } from '../modals/role';
import { ISortRequest } from '../../../../core/models/interface/Isort';
import { TableHeaderType } from '../../../../core/models/enums/table-header-type';
import { ITableHeader } from '../../../../core/models/interface/ItableHeader';
import { CommonModule } from '@angular/common';
import { FilterService } from '../../../../core/services/filter/filter';
import { Router } from '@angular/router';

import { Table } from '../../../shared/components/common/table/table';
import { NativeTableColumnTemplateDirective } from '../../../shared/components/common/table/directives/native-table-column-template.directive';
import { ITableAction, ISortEvent } from '../../../shared/components/common/table/models/table.types';

@Component({
  selector: 'app-role',
  imports: [
    ButtonModule,
    ManualRole,
    CommonModule,
    Table,
    NativeTableColumnTemplateDirective
  ],
  templateUrl: './role.html',
  styleUrl: './role.scss',
})

export class Role implements OnInit {
  tableColumns: ITableHeader[] = [];
  tableActions: ITableAction[] = [];

  isManualSidebarVisible = signal(false);

  // sort
  isSortingApplied: boolean = false;
  isSortSidebarVisible = signal(false);
  sortRequest: ISortRequest = {
    sortByLastAdded: true,
  };
  activeSortField?: string;
  activeSortAscending: boolean | null = null;

  // selection
  selectedRoles = signal<RoleResponse[]>([]);

  // api status
  PageStatus = ApiStatus;
  pageStatus: ApiStatus = ApiStatus.Loading;
  totalRecordsLength: number = 0;
  roleList = signal<RoleResponse[]>([]);
  selectedRole: any = null;

  // Request
  roleRequest: GetRoleRequest = {
    pageNumber: 1,
    pageSize: 10,
    sortByLastAdded: true,
    searchTerm: '',
  };

  sortVisible = signal(false);
  private readonly loginservice = inject(LoginService);
  private readonly roleservice = inject(Roleservice);
  private readonly filterService = inject(FilterService);
  private readonly router = inject(Router);
  constructor(private readonly HeaderActionService:HeaderActionService){}
  ngOnInit(): void {
    this.HeaderActionService.action$.subscribe((res)=>{
      if(res=='AddRole'){
        this.openManualSideBar();
      }
    })
    this.getTableActions();
    this.getTableColumns();
    this.getAllRoles();
  }

  getTableColumns(): void {
    this.tableColumns = [
      {
        field: 'id',
        name: 'id',
        type: TableHeaderType.String,
        recordKey: true,
        hidden: true,
      },
      {
        field: 'name',
        name: 'name',
        type: TableHeaderType.String,
        sortable: false
      },
      {
        field: 'description',
        name: 'description',
        type: TableHeaderType.String,
      },
      {
        field: 'roleCode',
        name: 'roleCode',
        type: TableHeaderType.String,
      },
      {
        field: 'usersCount',
        name: 'usersCount',
        type: TableHeaderType.String,
      },
      {
        field: 'isActive',
        name: 'activation',
        type: TableHeaderType.String,
      },
      {
        field: 'parentViewModels',
        name: 'parentRole',
        type: TableHeaderType.String,
      },
    ] as ITableHeader[];
  }

  getTableActions(): void {
    this.tableActions = [
      {
        key: 'go',
        type: 'menu',
        icon: 'pi pi-ellipsis-v',
        visible: true,
        items: [
          {
            key: 'edit',
            label: 'Edit',
            icon: 'pi pi-pencil',
            visible: true,
          },
          {
            key: 'delete',
            label: 'delete',
            icon: 'pi pi-trash',
            visible: true,
            condition: (row) => row.usersCount === 0,
          },
          {
            key: 'addPermission',
            label: 'add premission',
            icon: 'pi pi-lock',
            condition: (row) => row.isActive,
          },
        ],
      },
    ];
  }

  onTableAction(event: { action: string; row: any }): void {
    switch (event.action) {
      case 'edit':
        this.onEditRole(event.row);
        break;
      case 'delete':
        this.deleteRole(event.row.id);
        break;
      case 'addPermission':
        this.addPermission(event.row.id);
        break;
    }
  }

  // ===== Sort =====
  onSortChanged(event: ISortEvent): void {
    this.activeSortField = event.field;
    this.activeSortAscending = event.isAscending;

    this.roleRequest = {
      ...this.roleRequest,
      sortBy: event.field,
      isAscending: event.isAscending,
    } as any;

    this.getAllRoles();
  }

  // ===== Selection =====
  onSelectedRolesChanged(records: RoleResponse[]): void {
    this.selectedRoles.set(records);
  }

  openSortSidebar() {
    this.sortVisible.set(true);
  }

  openManualSideBar() {
    this.selectedRole = null;
    this.isManualSidebarVisible.set(true);
  }

  closeSortSidebar() {
    this.sortVisible.set(false);
  }

  closeManualSidebar() {
    this.isManualSidebarVisible.set(false);
    this.getAllRoles();
  }

  logOut() {
    this.loginservice.logout().subscribe({
      next: (res) => {

      },
      error: (err) => {},
      complete: () => {},
    });
  }

  onEditRole(rowdata: any) {
    this.roleservice.getRoleById(rowdata.id).subscribe({
      next: (res) => {
        this.selectedRole = res;
        console.log(res, this.selectedRole, 'onedit');
        this.isManualSidebarVisible.set(true);
      },
    });
  }

  getAllRoles(pageNumber = 1) {
    this.pageStatus = ApiStatus.Loading;
    this.roleRequest = {
      ...this.roleRequest,
      sortByLastAdded: this.sortRequest?.sortByLastAdded,
      pageNumber: pageNumber
    };
    const request = this.filterService.cleanRequest(this.roleRequest);
    this.roleservice.getAllRoles(request).subscribe({
      next: (res) => {
        this.roleList.set(
          res.items.map((item: any) => ({
            ...item,
            parentViewModels: item.parentViewModels[0]?.name
          }))
        );
        this.pageStatus = ApiStatus.Success;
        this.totalRecordsLength = res.records;
      },
      error: () => {
        this.pageStatus = ApiStatus.Error;
      },
      complete: () => {},
    });
  }

  deleteRole(roleId: string) {
    this.roleservice.deleteRole(roleId).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {

      },
      complete: () => {
        this.getAllRoles();
      }
    });
  }

  addPermission(id: string) {
    this.router.navigate(['/layout/premission'], { queryParams: { id } });
  }
}