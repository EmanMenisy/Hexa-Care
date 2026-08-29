import { inject, Injectable } from '@angular/core';
import { XhrService } from '../../../core/services/API/xhr/xhr';
import { Observable } from 'rxjs';
import { HttpMethod } from '../../../core/models/enums/http-method';
import { HttpParams } from '@angular/common/http';
export interface Company {
  companyId: string;
  name: string;
  organizationId: string;
}

export interface Branch {
  branchId: string;
  name: string;
  companyId: string;
}

export interface Department {
  departmentId: string;
  name: string;
  branchId: string;
}

export interface Team {
  teamId: string;
  name: string;
  departmentId: string;
}

export interface OrganizationalStructure {
  currentLevel?: string;
  currentHeadId?: string;
  organizationId?: string;
  companies: Company[];
  branches: Branch[];
  departments: Department[];
  teams: Team[];
}

export interface SystemRole {
  id: string;
  name: string;
}

export interface CustomRole {
  id: string;
  name: string;
  teams: string[];
}

export interface RolesResponse {
  getAllCoustemRoles: any[];
  getAllSystemRoles: SystemRole[];
}

@Injectable({
  providedIn: 'root',
})
export class AssignationService {
  private readonly xhrService = inject(XhrService);

  getOrganizationalStructure(): Observable<OrganizationalStructure> {
    return this.xhrService.call({
      method: HttpMethod.Get,
      url: `RoleScope/Get/Roleid`,
    });
  }
  

  getSystemAndCustomRoles(teamIds: string[]): Observable<RolesResponse> {
    let params = new HttpParams();
    teamIds.forEach((id) => {
      params = params.append('TeamIds', id);
    });
    return this.xhrService.call({
      method: HttpMethod.Get,
      url: `Role/GetAllRoleType`,
      params,
    });
  }

}
