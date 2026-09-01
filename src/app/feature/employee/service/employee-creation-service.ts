import { inject, Injectable } from '@angular/core';
import { XhrSocketService } from '../../../core/services/xhr-socket/xhr-socket';
import { XhrService } from '../../../core/services/API/xhr/xhr';
import { HttpMethod } from '../../../core/models/enums/http-method';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrganizationalStructure, RolesResponse } from '../model/employee-creation';

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

  getAllStaffMembers(payload:any): Observable<any>{
     return this.xhrService.call({
      method: HttpMethod.Get,
      url: 'StaffMembers/GetAll',
      params: new HttpParams({ fromObject: payload })
    });
  }

  createStaffMember(PayLoad:any): Observable<any>{
     return this.xhrService.call({
      method: HttpMethod.Post,
      url: 'StaffMembers/Create',
      body: PayLoad
    });
  }

   createDoctor(PayLoad:FormData): Observable<any>{
     return this.xhrService.call({
      method: HttpMethod.Post,
      url: 'Doctors/Create',
      body: PayLoad
     });
    }
  
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

  getStuffMemberById(staffMemberId:string){
    return this.xhrService.call({
      method: HttpMethod.Get,
      url: `StaffMembers/GetById`,
      params: new HttpParams({ fromObject: {StaffMemberId:staffMemberId}})
    });
  }

 
  updateStaffMember(PayLoad:FormData){
    return this.xhrService.call({
      method: HttpMethod.Put,
      url: `StaffMembers/UpdateStaffMember`,
      body: PayLoad
    });
  }

  updateDoctor(payload: FormData): Observable<any> {
  return this.xhrService.call({
    method: HttpMethod.Put,
    url: 'Doctors/Update',
    body: payload,
  });
  }

  uploadFile(payload: FormData): Observable<any> {
  return this.xhrService.call({
    method: HttpMethod.Post,
    url: 'Attachments/Upload',
    body: payload,
  });
 }

 //will remove later
  getAllDoctors(payload: any): Observable<any> {
   return this.xhrService.call({
    method: HttpMethod.Get,
    url: 'Doctors/GetAll',
    params: new HttpParams({ fromObject: payload })
   });
 }

   getDoctorDetails(doctorId: any): Observable<any> {
   return this.xhrService.call({
    method: HttpMethod.Get,
    url: 'Doctors/Details',
    params: new HttpParams({ fromObject: {id: doctorId}})
   });
  }
 
  getAttachment(employeeId: any): Observable<any> {
   return this.xhrService.call({
    method: HttpMethod.Get,
    url: 'Attachments/GetAll',
    params: new HttpParams({ fromObject: {EntityId: employeeId}})
   });
  }

  deleteAttachment(attachmentId: any): Observable<any> {
   return this.xhrService.call({
    method: HttpMethod.Delete,
    url: 'Attachments/Delete',
    body: {attachmentId: attachmentId}
   });
  }

}

