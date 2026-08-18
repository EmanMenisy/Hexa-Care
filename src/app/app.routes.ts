import { Routes } from '@angular/router';
import { Login } from './feature/Login/components/login/login';
import { Layout } from './feature/shared/layout/layout/layout';
import { authGuard } from './core/guards/auth-guard/auth-guard-guard';
import { Component } from '@angular/core';
import { Role } from './feature/configuration/role/pages/role';

export const routes: Routes = [
  {
    path: '',
    component: Login,
  },
  {
    path: 'layout',
    // canActivate:[authGuard],
    component: Layout, children:[
      {path:'' , component:Role}
    ]
  },
];
