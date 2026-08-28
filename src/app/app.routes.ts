import { Routes } from '@angular/router';
import { Login } from './feature/Login/components/login/login';
import { Layout } from './feature/shared/layout/layout/layout';
import { authGuard } from './core/guards/auth-guard/auth-guard-guard';
import { Component } from '@angular/core';
import { Role } from './feature/configuration/role/pages/role';
import { Premissions } from './feature/configuration/premissions/pages/premissions/premissions';
import { EmployeeCreation } from './feature/employee/partials/employee-creation/employee-creation';

export const routes: Routes = [
  {
    path: '',
    redirectTo:'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'layout',
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
    ]
  },
];
