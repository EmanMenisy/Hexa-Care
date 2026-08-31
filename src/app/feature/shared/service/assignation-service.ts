import { inject, Injectable } from '@angular/core';
import { XhrService } from '../../../core/services/API/xhr/xhr';
import { Observable } from 'rxjs';
import { HttpMethod } from '../../../core/models/enums/http-method';
import { HttpParams } from '@angular/common/http';
import { OrganizationalStructure, RolesResponse } from '../../employee/model/employee-creation';


@Injectable({
  providedIn: 'root',
})
export class AssignationService {
  private readonly xhrService = inject(XhrService);



}
