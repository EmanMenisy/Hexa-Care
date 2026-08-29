import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpMethod } from '../../../core/models/enums/http-method';
import { HttpParams } from '@angular/common/http';
import { XhrService } from '../../../core/services/API/xhr/xhr';

@Injectable({
  providedIn: 'root',
})
export class Organization {
  constructor(private readonly xhrService: XhrService) { }
  //==============Helpers
  getCountries(): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Get,
      url: `Country/List`,
    });
  }
  getStatesByCountryId(countryId: string): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Get,
      url: `State/GetList?CountryId=${countryId}`,
    });
  }
  getCitiesByStateId(stateId?: string): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Get,
      url: `City/GetList`,
      params: stateId ? new HttpParams().set('stateId', stateId) : new HttpParams()
    });
  }
  //==============Company
  getCompanies(getCompaniesRequest: any): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Get,
      url: 'Company/GetAll',
      params: new HttpParams({ fromObject: getCompaniesRequest })
    });
  }
  getCompanyById(id: string): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Get,
      url: `Company/GetById`,
      params: new HttpParams().set('ID', id)
    });
  }
  updateCompany(updateCompanyRequest: any): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Put,
      url: 'Company/Update',
      body: updateCompanyRequest
    });
  }
  deleteCompany(id: string): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Delete,
      url: 'Company/Delete',
      body: {
        id
      }
    });
  }
  //==============Branch
  getBranches(getBranchesRequest: any): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Get,
      url: 'Branch/GetAll',
      params: new HttpParams({ fromObject: getBranchesRequest })
    });
  }
  getBranchById(id: string): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Get,
      url: 'Branch/GetById',
      params: new HttpParams().set('ID', id)
    });
  }
  updateBranch(updateBranchRequest: any): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Put,
      url: 'Branch/Update',
      body: updateBranchRequest
    });
  }
  deleteBranch(id: string): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Delete,
      url: 'Branch/Delete',
      body: {
        id
      }
    });
  }
  //==============Department
  getAllDepartments(departmentRequest:any): Observable<any> {
    return this.xhrService.call({
      url: 'Department/GetAll',
      method: HttpMethod.Get,
      params: new HttpParams({ fromObject: departmentRequest }),
    });
  }
  onDeleteDepartment(id: string): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Delete,
      url: `Department/Delete`,
      params: new HttpParams().set('ID', id),
    });
  }
  onUpdateDepartment(updateDepartmentRequest: any): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Put,
      url: 'Department/Update',
      body: updateDepartmentRequest,
    });
  }
  getDepartmentById(id:string):Observable<any>{
    return this.xhrService.call({
      method: HttpMethod.Get,
      url: 'Department/GetById',
      params: new HttpParams().set('ID', id),
    })
  }
  //==============Team
  getAllTeams(teamRequest:any): Observable<any> {
    return this.xhrService.call({
      url: 'Team/GetAll',
      method: HttpMethod.Get,
      params: new HttpParams({ fromObject: teamRequest }),
    });
  }
  onDeleteTeam(id: string): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Delete,
      url: 'Team/Delete',
      params: new HttpParams().set('ID', id),
    });
  }
  onUpdateTeam(updateTeamRequest: any): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Put,
      url: 'Team/Update',
      body: updateTeamRequest,
    });
  }
  getTeamById(id:string):Observable<any>{
    return this.xhrService.call({
      method: HttpMethod.Get,
      url: 'Team/GetById',
      params: new HttpParams().set('ID', id),
    })
  }
}
