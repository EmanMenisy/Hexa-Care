import { TranslatePipe } from "@ngx-translate/core";
import { NotFound } from "../shared/components/common/not-found/not-found";
import { Table } from "../shared/components/common/table/table";
import { ButtonComponent } from "../shared/components/primeng/button/button";
import { InputTextComponent } from "../shared/components/primeng/input-text/input-text";
import { EmptyState } from "../shared/components/common/empty-state/empty-state";
import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { EmployeeCreationService } from "../employee/service/employee-creation-service";
import { Router } from "@angular/router";
import { HeaderActionService } from "../shared/layout/sub-header/services/header-action.service";
import { ITableHeader } from "../../core/models/interface/ItableHeader";
import { ISortEvent, ITableAction } from "../shared/components/common/table/models/table.types";
import { ApiStatus } from "../../core/models/enums/api-status";
import { TableHeaderType } from "../../core/models/enums/table-header-type";
import { EmployeeCreationMode } from "../employee/model/enums/employee-Creation-enums";
import { FilterService } from "../../core/services/filter/filter";

@Component({
  selector: 'app-doctor',
  imports: [    CommonModule,
      Table,
      NotFound,
      InputTextComponent,
      ButtonComponent,
      TranslatePipe,
      EmptyState,],
  templateUrl: './doctor.html',
  styleUrl: './doctor.scss',
})
export class Doctor {
private readonly creationService = inject(EmployeeCreationService);
  private readonly HeaderActionService = inject(HeaderActionService);
  private readonly filterService = inject(FilterService);
  private router = inject(Router);
  

  ngOnInit() {
    this.HeaderActionService.action$.subscribe((res) => {
      if (res == 'create') {
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

  //====================Table configurations
  getTableColumns(): void {
    this.tableColumns = [
  {
    field: 'doctorCode',
    name: 'employee.table.doctor_code',
    type: TableHeaderType.String,
    sortable: false,
  },
  {
    field: 'fullName',
    name: 'employee.table.full_name',
    type: TableHeaderType.String,
  },
  {
    field: 'rank',
    name: 'employee.table.rank',
    type: TableHeaderType.Number,
  },
  {
    field: 'specialty',
    name: 'employee.table.specialty',
    type: TableHeaderType.String,
  },
  {
    field: 'phone',
    name: 'employee.table.phone',
    type: TableHeaderType.String,
  },
  {
    field: 'gender',
    name: 'employee.table.gender',
    type: TableHeaderType.Number,
  },
  {
    field: 'isActive',
    name: 'employee.table.status',
    type: TableHeaderType.Boolean,
  },
  {
    field: 'createdAt',
    name: 'employee.table.created_at',
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
    this.creationService.getAllDoctors(request).subscribe({
      next: (res) => {
        console.log(res , 'all staff');
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
    queryParams: { mode: EmployeeCreationMode.Doctor },
    });;
  }

  //====================Delete
  onDelete(roleId: string) {}

  routeToSectorPage() {
    this.router.navigate(['sector']);
  }
}
