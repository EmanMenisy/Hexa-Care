import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SortSidebarComponent } from '../../../shared/components/common/sort-sidebar/sort-sidebar';
import { ManualRole } from "../partials/manual-role/manual-role";
import { LoginService } from '../../../Login/service/login';
import { Roleservice } from '../service/roleservice';
import { ApiStatus } from '../../../../core/models/enums/api-status';
import { GetRoleRequest, RoleFilters, RoleResponse } from '../modals/role';
import { ISortRequest } from '../../../../core/models/interface/Isort';
import { TableHeaderType } from '../../../../core/models/enums/table-header-type';
import { ITableHeader } from '../../../../core/models/interface/ItableHeader';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FilterService } from '../../../../core/services/filter/filter';
import { TableModule } from 'primeng/table';
import { ButtonComponent } from "../../../shared/components/primeng/button/button";
import { Router } from '@angular/router';


@Component({
  selector: 'app-role',
  imports: [
    ButtonModule,
    ManualRole,
    CommonModule,
    TableModule,
    ButtonComponent
],
  templateUrl: './role.html',
  styleUrl: './role.scss',
})

export class Role implements OnInit {
  tableColumns: ITableHeader[] = [];
  tableActions: any[] = [];

  isManualSidebarVisible= signal(false)
  //sort
  isSortingApplied: boolean = false;
  isSortSidebarVisible = signal(false)
  sortRequest: ISortRequest = {
    sortByLastAdded: true,
  };

  
  // api status
  PageStatus = ApiStatus;
  pageStatus: ApiStatus = ApiStatus.Loading;
  totalRecordsLength: number = 0;
  roleList = signal<RoleResponse[]>([]);
  selectedRole: any = null;

  //Request
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

  ngOnInit(): void {
    this.getTableActions();
    this.getTableColumns();
    this.getAllRoles();
  }

    getTableColumns(): void {
    this.tableColumns = [
      {
        field: 'name',
        name: 'configurations.role.table.name',
        type: TableHeaderType.String,
      },
      {
        field: 'description',
        name: 'configurations.role.table.description',
        type: TableHeaderType.String,
      },
      {
        field: 'roleCode',
        name: 'configurations.role.table.roleCode',
        type: TableHeaderType.String,
      },
      {
        field: 'usersCount',
        name: 'configurations.role.table.usersCount',
        type: TableHeaderType.String,
      },
      {
        field: 'status',
        name: 'configurations.role.table.activation',
        dynamicStyle: 'styleColor',
        type: TableHeaderType.String,
      },
      {
        field: 'parentViewModels',
        name: 'configurations.role.table.parentRole',
        type: TableHeaderType.String,
      },
    ];
  }

    getTableActions(): void {
    this.tableActions = [
      {
        label: 'Edit',
        command: (rowData: any) => {},
        visible: true,
      },
      {
        label: 'Delete',
        command: (rowData: any) => {
          
        },
        visible: true,
      },
    ];
  }

  openSortSidebar() {
    this.sortVisible.set(true); 
  }

  openManualSideBar(){
    this.selectedRole = null;
    this.isManualSidebarVisible.set(true);
  }

  closeSortSidebar() {
    this.sortVisible.set(false);
    console.log('hello from parent' , this.sortVisible());
  }

  closeManualSidebar() {
    this.isManualSidebarVisible.set(false);
    this.getAllRoles();
  }
  
  logOut(){
    this.loginservice.logout().subscribe({
      next:(res)=>{
      
      },
      error:(err)=>{},
      complete:()=>{},
    })
  }

  onEditRole(rowdata: any) {
    this.roleservice.getRoleById(rowdata.id).subscribe({
      next: (res) => {
        this.selectedRole = res;
        console.log(res ,   this.selectedRole , 'onedit');
        this.isManualSidebarVisible.set(true);
      },
    });
  }

  getAllRoles(pageNumber = 1){
     this.pageStatus = ApiStatus.Loading;
     this.roleRequest = {
      ...this.roleRequest,
      sortByLastAdded: this.sortRequest?.sortByLastAdded,
      pageNumber: pageNumber
    };
    const request = this.filterService.cleanRequest(this.roleRequest);
    this.roleservice.getAllRoles(request).subscribe({
      next:(res)=>{
       this.roleList.set(res.items);
       console.log(res);
       this.pageStatus = ApiStatus.Success;
       this.totalRecordsLength = res.records;
      },
      error:()=>{
        this.pageStatus = ApiStatus.Error;
      },
      complete:()=>{},
    })
  }


  deleteRole(roleId:string){
    this.roleservice.deleteRole(roleId).subscribe({
      next:(res)=>{
        console.log(res)
      },
      error:(err)=>{
          
      },
      complete:()=>{
        this.getAllRoles();
      }
    })
  }

  addPermission(id:string){
    this.router.navigate(['/layout/premission'] , { queryParams: { id } });
  }
}