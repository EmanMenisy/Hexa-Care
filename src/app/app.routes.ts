import { Routes } from '@angular/router';
import { Login } from './feature/Login/components/login/login';
import { Layout } from './feature/shared/layout/layout/layout';
import { authGuard } from './core/guards/auth-guard/auth-guard-guard';
import { Component } from '@angular/core';
import { Role } from './feature/configuration/role/pages/role';
import { Premissions } from './feature/configuration/premissions/pages/premissions/premissions';
import { EmployeeCreation } from './feature/employee/partials/employee-creation/employee-creation';
import { OrganizationProfile } from './feature/organization/pages/organization-profile/organization-profile';
import { Company } from './feature/organization/pages/company/company';
import { Branch } from './feature/organization/pages/branch/branch';
import { Department } from './feature/organization/pages/department/department';
import { Team } from './feature/organization/pages/team/team';
import { HomeEmployeeCreation } from './feature/employee/pages/home-employee-creationon/home-employee-creation';
import { Attachments } from './feature/employee/partials/attachments/attachments';
import { SectorPage } from './feature/employee/partials/sector-page/sector-page';
import { Doctor } from './feature/doctor/doctor';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
  },
  {
    path: '',
    // canActivate:[authGuard],
    component: Layout,
     children:[
      {path:'creation' , component:EmployeeCreation},
      {path:'role' , component:Role,
        data:{
          header:{
            title:"Role And Permission",
            subtitle:"Start your role and permission page ",
            buttons:[
              {
                label:"Add Role",
                icon:'pi pi-plus',
                action:'AddRole'
              }
            ]
          }
        }
      },
      {
        path:'home' ,
        component:HomeEmployeeCreation,
         data:{
          header:{
            title:"employee.header.title",
            subtitle:"employee.header.subtitle",
            buttons:[
              {
                label:"new Staff",
                icon:'pi pi-plus',
                action:'createStaff',
              },
            ]
          }
        }
      },
      { path: 'update/:id', component: EmployeeCreation },
      {path:'sector' , component:SectorPage},
      {path:'doctors' , component:Doctor,
         data:{
          header:{
            title:"doctor.header.title",
            subtitle:"doctor.header.subtitle",
            buttons:[
              {
                label:"new doctor",
                icon:'pi pi-plus',
                action:'createDoctor',
              },
            ]
          }
        }
      },

      {
        path:'organizationProfile' ,
        component:OrganizationProfile,
      },
      {
        path:'company' ,
        component:Company,
      },
      {
        path:'branch' ,
        component:Branch,
      },
      {
        path:'department' ,
        component:Department,
      },
      {
        path:'team' ,
        component:Team,
      }
    ]
  },
];
