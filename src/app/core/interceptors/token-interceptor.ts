// import {
//   HttpErrorResponse,
//   HttpInterceptorFn,
// } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { Router } from '@angular/router';
// import {
//   catchError,
//   switchMap,
//   throwError,
// } from 'rxjs';

// import { TokenService } from '../services/token/token-service';

// export const tokenInterceptor: HttpInterceptorFn = (
//   req,
//   next
// ) => {
//   const tokenService = inject(TokenService);
//   const router = inject(Router);

//   // ==========================================
//   // 1. External API
//   // ==========================================

//   const isExternal =
//     req.headers.has('isExternal');

//   if (isExternal) {
//     const cleanRequest = req.clone({
//       headers: req.headers.delete('isExternal'),
//     });

//     return next(cleanRequest);
//   }

//   // ==========================================
//   // 2. Authentication endpoints
//   // ==========================================

//   const isAuthEndpoint =
//     req.url.includes('/Authentication/Login') ||
//     req.url.includes('/Authentication/RefreshToken') ||
//     req.url.includes('/Authentication/Logout');

//   if (isAuthEndpoint) {
//     return next(req);
//   }

//   // ==========================================
//   // 3. Get Access Token
//   // ==========================================

//   const accessToken =
//     tokenService.getAccessToken();

//   // no access token
//   if (!accessToken) {
//     return next(req);
//   }

//   // ==========================================
//   // 4. Add Authorization Header
//   // ==========================================

//   const authRequest = req.clone({
//     setHeaders: {
//       Authorization: `Bearer ${accessToken}`,
//     },
//   });

//   // ==========================================
//   // 5. Send Request
//   // ==========================================

//   return next(authRequest).pipe(

//     catchError(
//       (error: HttpErrorResponse) => {

//         // أي error غير 401
//         if (error.status !== 401) {
//           return throwError(
//             () => error
//           );
//         }

//         // ======================================
//         // 6. Access Token expired
//         // ======================================

//         return tokenService
//           .refreshToken()
//           .pipe(

//             // ==================================
//             // 7. Refresh successful
//             // ==================================

//             switchMap(
//               (newAccessToken) => {

//                 // نعيد نفس الـ request
//                 // بالتوكن الجديد
//                 const retryRequest =
//                   req.clone({
//                     setHeaders: {
//                       Authorization:
//                         `Bearer ${newAccessToken}`,
//                     },
//                   });

//                 return next(
//                   retryRequest
//                 );
//               }
//             ),

//             // ==================================
//             // 8. Refresh failed
//             // ==================================

//             catchError(
//               (refreshError) => {

//                 tokenService.clearTokens();

//                 router.navigate([
//                   '/login',
//                 ]);

//                 return throwError(
//                   () => refreshError
//                 );
//               }
//             )
//           );
//       }
//     )
//   );
// };