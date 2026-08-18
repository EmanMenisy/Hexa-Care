import { inject, Injectable, Pipe } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { XhrService } from '../xhr/xhr';
import { HttpMethod } from '../../../models/enums/http-method';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly xhrService = inject(XhrService)

  private _isAuthenticated = false;
  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }
  setAuthenticated(status: boolean) {
  this._isAuthenticated = status;
  }
  checkBackendAuth(): Observable<any> {
    return this.xhrService.call({
      url: "/Authentication/CheckTokenExpiry",
      method: HttpMethod.Get
    }).pipe(
      tap((res: any) => {
        this._isAuthenticated = !res.isExpired;
      }),
      catchError((error) => {
        this._isAuthenticated = false;
        return of(false);
      })
    );
  }
}
