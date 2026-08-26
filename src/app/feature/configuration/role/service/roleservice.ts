import { inject, Injectable } from '@angular/core';
import { XhrService } from '../../../../core/services/API/xhr/xhr';
import { Observable } from 'rxjs';
import { HttpMethod } from '../../../../core/models/enums/http-method';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Roleservice {
  private readonly xhrService = inject(XhrService);

  getAllParentRoles(): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Get,
      url: 'Role/GetAllParent',
    });
  }

  getAllChildrenRoles(id: string): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Get,
      url: 'Role/GetChildrenRole',
      params: new HttpParams({ fromObject: { ParentRoleId: id } }),
    });
  }

  createRole(payload: string): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Post,
      url: 'Role/Create',
      body: payload,
    });
  }

  updateRole(payload: any): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Put,
      url: 'Role/Update',
      body: payload,
    });
  }

  getAllRoles(payload: any): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Get,
      url: 'Role/GetAll',
      body: payload,
    });
  }

  getRoleById(id: string): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Get,
      url: 'Role/GetById',
      params: new HttpParams({ fromObject: { id: id } }),
    });
  }

  deleteRole(id: string): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Delete,
      url: 'Role/Delete',
      body: {id:id},
    });
  }
}
