import { inject, Injectable } from '@angular/core';
import { XhrService } from '../../../../core/services/API/xhr/xhr';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { HttpMethod } from '../../../../core/models/enums/http-method';

@Injectable({
  providedIn: 'root',
})
export class premissionService {
  private readonly xhrService = inject(XhrService);



    // Get  Roles
  getAllRoles(payload: any): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Get,
      url: 'Role/GetAll',
      params: new HttpParams({ fromObject: payload }),
    });
  }


  // Get  features
  getAllFeatures( RoleId: string): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Get,
      url: 'Feature/GetAll',
      params: new HttpParams({ fromObject: {RoleId:RoleId}}),
    });
  }
}
