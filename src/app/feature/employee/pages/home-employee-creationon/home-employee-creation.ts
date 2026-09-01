import { Component, computed, inject, signal } from '@angular/core';
import { EmployeeCreationService } from '../../service/employee-creation-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmployeeCreationMode } from '../../model/enums/employee-Creation-enums';
import { InputTextComponent } from '../../../shared/components/primeng/input-text/input-text';
import { TranslatePipe } from '@ngx-translate/core';
import { Table } from '../../../shared/components/common/table/table';
import { ButtonComponent } from '../../../shared/components/primeng/button/button';
import { ITableHeader } from '../../../../core/models/interface/ItableHeader';
import {
  ISortEvent,
  ITableAction,
} from '../../../shared/components/common/table/models/table.types';
import { HeaderActionService } from '../../../shared/layout/sub-header/services/header-action.service';
import { TableHeaderType } from '../../../../core/models/enums/table-header-type';
import { ApiStatus } from '../../../../core/models/enums/api-status';
import { FilterService } from '../../../../core/services/filter/filter';
import { EmptyState } from '../../../shared/components/common/empty-state/empty-state';
import { NotFound } from '../../../shared/components/common/not-found/not-found';

@Component({
  selector: 'app-home-employee-creation',
  imports: [
    CommonModule,
    Table,
    NotFound,
    InputTextComponent,
    ButtonComponent,
    TranslatePipe,
    EmptyState,
  ],
  templateUrl: './home-employee-creation.html',
  styleUrl: './home-employee-creation.scss',
})
export class HomeEmployeeCreation {
  private readonly creationService = inject(EmployeeCreationService);
  private readonly HeaderActionService = inject(HeaderActionService);
  private readonly filterService = inject(FilterService);
  private router = inject(Router);
  selectedSector = signal<boolean | null>(null);
  staffTypes = signal<any[]>([]);

  ngOnInit() {
    this.HeaderActionService.action$.subscribe((res) => {
      if (res == 'createStaff') {
        this.routeToSectorPage();
      }
    });
    this.getTableColumns();
    this.getTableActions();
    this.getAllList();
  }

  //====================Table
  tableColumns: ITableHeader[] = [];
  tableActions: ITableAction[] = [];
  activeSortField?: string;
  activeSortAscending: boolean | null = null;
  totalRecordsLength: number = 0;

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

  //====================Table configurations
  getTableColumns(): void {
   this.tableColumns = [
  {
    field: 'staffCode',
    name: 'employee.home.table.staff_code',
    type: TableHeaderType.String,
    sortable: false,
  },
  {
    field: 'firstName',
    name: 'employee.home.table.first_name',
    type: TableHeaderType.String,
  },
  {
    field: 'secondName',
    name: 'employee.home.table.second_name',
    type: TableHeaderType.String,
  },
  {
    field: 'thirdName',
    name: 'employee.home.table.third_name',
    type: TableHeaderType.String,
  },
  {
    field: 'lastName',
    name: 'employee.home.table.last_name',
    type: TableHeaderType.String,
  },
  {
    field: 'name',
    name: 'employee.home.table.name',
    type: TableHeaderType.String,
  },
  {
    field: 'nameArabic',
    name: 'employee.home.table.name_arabic',
    type: TableHeaderType.String,
  },
  {
    field: 'jobTitle',
    name: 'employee.home.table.job_title',
    type: TableHeaderType.String,
  },
  {
    field: 'roleName',
    name: 'employee.home.table.role_name',
    type: TableHeaderType.String,
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
        this.onEdit(event.row.id);
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
  getAllList(pageNumber = 1) {
    this.pageStatus = ApiStatus.Loading;
    this.payload = {
      ...this.payload,
      pageNumber: pageNumber,
    };
    const request = this.filterService.cleanRequest(this.payload);
    this.isFilterApplied.set(this.hasFilters());
    this.creationService.getAllStaffMembers(request).subscribe({
      next: (res) => {
        this.list.set(res.items);
        this.pageStatus = ApiStatus.Success;
        this.totalRecordsLength = res.records;
      },
      error: (err) => {
        this.pageStatus = ApiStatus.Error;
      },
    });
  }
  //====================Has Filter
  hasFilters(): boolean {
    return !!this.payload.name?.trim();
  }

  onEdit(id: string) {
  this.router.navigate(['/update', id], {
    queryParams: { mode: EmployeeCreationMode.StaffMember },
    });;
  }

  //====================Delete
  onDelete(roleId: string) {}

  routeToSectorPage() {
    this.router.navigate(['sector']);
  }
}

