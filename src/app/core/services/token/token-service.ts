// import { Injectable, inject } from '@angular/core';
// import { HttpClient } from '@angular/common/http';

// import {
//   BehaviorSubject,
//   Observable,
//   throwError,
// } from 'rxjs';

// import {
//   catchError,
//   filter,
//   finalize,
//   map,
//   take,
//   tap,
// } from 'rxjs/operators';

// import { environment } from '../../../../environments/environment.development';

// interface RefreshTokenResponse {
//   data: {
//     accessToken: string;
//     refreshToken: string;
//     accessTokenExpiry: string;
//     refreshTokenExpiry: string;
//   };
//   isSuccess: boolean;
//   message: string;
//   errorCode: number;
//   isAuthorized: boolean;
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class TokenService {

//   private readonly http = inject(HttpClient);

//   private readonly accessTokenKey = 'accessToken';
//   private readonly refreshTokenKey = 'refreshToken';

//   private isRefreshing = false;

//   private readonly refreshSubject =
//     new BehaviorSubject<string | null>(null);


//   // ==========================================
//   // Get Access Token
//   // ==========================================

//   getAccessToken(): string | null {
//     return localStorage.getItem(
//       this.accessTokenKey
//     );
//   }


//   // ==========================================
//   // Get Refresh Token
//   // ==========================================

//   getRefreshToken(): string | null {
//     return localStorage.getItem(
//       this.refreshTokenKey
//     );
//   }


//   // ==========================================
//   // Save Tokens
//   // ==========================================

//   setTokens(
//     accessToken: string,
//     refreshToken: string
//   ): void {
//     localStorage.setItem(
//       this.accessTokenKey,
//       accessToken
//     );

//     localStorage.setItem(
//       this.refreshTokenKey,
//       refreshToken
//     );
//   }


//   // ==========================================
//   // Refresh Token
//   // ==========================================

//   refreshToken(): Observable<string> {

//     // Return the ongoing refresh request if one is already in progress.
//     if (this.isRefreshing) {
//       return this.refreshSubject.pipe(
//         filter(
//           (token): token is string =>
//             token !== null
//         ),
//         take(1)
//       );
//     }

//     const refreshToken =
//       this.getRefreshToken();

//     // Stop if no refresh token is available.
//     if (!refreshToken) {
//       return throwError(
//         () =>
//           new Error(
//             'Refresh token not found'
//           )
//       );
//     }

//     this.isRefreshing = true;

//     // Reset the subject while refreshing.
//     this.refreshSubject.next(null);

//     return this.http
//       .post<RefreshTokenResponse>(
//         `${environment.backendUrl}/Authentication/RefreshToken`,
//         {
//           refreshToken,
//         }
//       )
//       .pipe(

//         // Save the new tokens when refresh succeeds.
//         tap((response) => {

//           const data = response.data;

//           this.setTokens(
//             data.accessToken,
//             data.refreshToken
//           );

//           // Notify waiting requests with the new access token.
//           this.refreshSubject.next(
//             data.accessToken
//           );
//         }),

//         // Return only the new access token.
//         map(
//           (response) =>
//             response.data.accessToken
//         ),

//         // Handle refresh failure.
//         catchError((error) => {

//           this.refreshSubject.next(null);

//           return throwError(
//             () => error
//           );
//         }),

//         // Reset the refresh state when the request completes.
//         finalize(() => {
//           this.isRefreshing = false;
//         })
//       );
//   }


//   // ==========================================
//   // Clear Tokens
//   // ==========================================

//   clearTokens(): void {
//     localStorage.removeItem(
//       this.accessTokenKey
//     );

//     localStorage.removeItem(
//       this.refreshTokenKey
//     );
//   }
// }