import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  // External API
  const isExternal = req.headers.has('isExternal');

  if (isExternal) {
    const cleanRequest = req.clone({
      headers: req.headers.delete('isExternal'),
    });

    return next(cleanRequest);
  }

  // Authentication endpoints
  const isAuthEndpoint =
    req.url.includes('/Authentication/Login') ||
    req.url.includes('/Authentication/RefreshToken') ||
    req.url.includes('/Authentication/Logout');

  if (isAuthEndpoint) {
    return next(req);
  }

  // Access token
  const accessToken = localStorage.getItem('access_token');

  // No token
  if (!accessToken) {
    return next(req);
  }

  // Add Authorization
  const authRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return next(authRequest);

  //handle token - refresh token
  
};