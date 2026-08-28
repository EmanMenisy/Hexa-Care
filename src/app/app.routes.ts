import { Routes } from '@angular/router';
import { Login } from './feature/Login/components/login/login';
import { Layout } from './feature/shared/layout/layout/layout';
import { authGuard } from './core/guards/auth-guard/auth-guard-guard';
import { Component } from '@angular/core';
import { Role } from './feature/configuration/role/pages/role';
import { Premissions } from './feature/configuration/premissions/pages/premissions/premissions';
import { EmployeeCreation } from './feature/employee/partials/employee-creation/employee-creation';
import { OrganizationProfile } from './feature/organization/pages/organization-profile/organization-profile';

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
      {path:'premission' , component:Premissions},
      {path:'organizationProfile' , component:OrganizationProfile,
        data:{
          header:{
            title:"Organization Profile",
            subtitle:"Identity, basic, operational, contact and administration data",
            buttons:[
              {
                label:"buttons.edit",
                icon:'pi pi-pen-to-square',
                action:'edit',
              },
               {
                label:"buttons.cancel",
                action:'cancel',
                severity:'secondary'
              },
               {
                label:"buttons.save",
                icon:'pi pi-save',
                action:'save'
              }
            ]
          }
        }
      },
    ]
  },
];
