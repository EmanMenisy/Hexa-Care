import { inject, Injectable } from '@angular/core';
import { XhrSocketService } from '../../../core/services/xhr-socket/xhr-socket';
import { XhrService } from '../../../core/services/API/xhr/xhr';
import { HttpMethod } from '../../../core/models/enums/http-method';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmployeeCreationService {
  private readonly xhrService = inject(XhrService);

  getAllStaffMemberTypes(): Observable<any>{
     return this.xhrService.call({
      method: HttpMethod.Get,
      url: 'StaffMemberType/GetAll',
    });
  }
}
