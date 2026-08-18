import { inject, Injectable } from '@angular/core';
import { XhrService } from '../../../core/services/API/xhr/xhr';
import { HttpMethod } from '../../../core/models/enums/http-method';
import { Observable } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/login-model';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
    private readonly xhrService = inject(XhrService)
    login(loginData: LoginRequest): Observable<LoginResponse> {
    return this.xhrService.call({
      method: HttpMethod.Post,
      url: 'Authentication/Login',
      body: loginData,
    });
  }

  logout(): Observable<any> {
    return this.xhrService.call({
      method: HttpMethod.Post,
      url: 'Authentication/Logout',
      body :{}
    });
  }
}
