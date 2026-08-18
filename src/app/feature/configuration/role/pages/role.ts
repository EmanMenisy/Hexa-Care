import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SortSidebarComponent } from '../../../shared/components/common/sort-sidebar/sort-sidebar';
import { ManualRole } from "../partials/manual-role/manual-role";
import { LoginService } from '../../../Login/service/login';
import { Roleservice } from '../service/roleservice';
import { ApiStatus } from '../../../../core/models/enums/api-status';
import { GetRoleRequest, RoleFilters } from '../modals/role';
import { ISortRequest } from '../../../../core/models/interface/Isort';

@Component({
  selector: 'app-role',
  imports: [
    ButtonModule,
    ManualRole
],
  templateUrl: './role.html',
  styleUrl: './role.scss',
})

export class Role implements OnInit {

    // api status
  PageStatus = ApiStatus;
  pageStatus: ApiStatus = ApiStatus.Loading;
  //Request
  roleRequest: GetRoleRequest = {
    pageNumber: 1,
    pageSize: 10,
    sortByLastAdded: true,
    searchTerm: '',
  };


  //sort
  isSortingApplied: boolean = false;
  isSortSidebarVisible: boolean = false;
  sortRequest: ISortRequest = {
    sortByLastAdded: true,
  };


  sortVisible = signal(false);
  private readonly loginservice = inject(LoginService);
  private readonly roleservice = inject(Roleservice);


  ngOnInit(): void {
    console.log('hello');
    
  }

  openSortSidebar() {
    this.sortVisible.set(true);
    console.log(this.sortVisible());
    
  }

  closeSortSidebar() {
    this.sortVisible.set(false);
    console.log('hello from parent' , this.sortVisible());
  }
  
  logOut(){
    this.loginservice.logout().subscribe({
      next:(res)=>{},
      error:(err)=>{},
      complete:()=>{},
    })
  }

  getAllRoles(){
    const payload ={}
    this.roleservice.getAllRoles(payload).subscribe({
      next:()=>{},
      error:()=>{},
      complete:()=>{},
    })
  }
}