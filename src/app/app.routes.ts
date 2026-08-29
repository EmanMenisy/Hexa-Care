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
      {path:'home' , component:HomeEmployeeCreation},
      {
        path:'organizationProfile' ,
        component:OrganizationProfile,
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
      {
        path:'company' ,
        component:Company,
        data:{
          header:{
            title:"organization.company.home.title",
            subtitle:"organization.company.home.subtitle",
            buttons:[
              {
                label:"organization.company.home.addCompany",
                icon:'pi pi-plus',
                action:'create',
              },
            ]
          }
        }
      },
      {
        path:'branch' ,
        component:Branch,
        data:{
          header:{
            title:"organization.branch.home.title",
            subtitle:"organization.branch.home.subtitle",
            buttons:[
              {
                label:"organization.branch.home.addBranch",
                icon:'pi pi-plus',
                action:'create',
              },
            ]
          }
        }
      },
      {
        path:'department' ,
        component:Department,
        data:{
          header:{
            title:"organization.department.home.title",
            subtitle:"organization.department.home.subtitle",
            buttons:[
              {
                label:"organization.department.home.addDepartment",
                icon:'pi pi-plus',
                action:'create',
              },
            ]
          }
        }
      },
      {
        path:'team' ,
        component:Team,
        data:{
          header:{
            title:"organization.team.home.title",
            subtitle:"organization.team.home.subtitle",
            buttons:[
              {
                label:"organization.team.home.addTeam",
                icon:'pi pi-plus',
                action:'create',
              },
            ]
          }
        }
      }
    ]
  },
];
