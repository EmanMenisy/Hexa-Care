import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FeatureService } from '../../services/features/features';

export const pageGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const permissionService = inject(FeatureService);

  const requiredPageCode = route.data['pageCode'];
  const requiredFeatureCode = route.data['featureCode'];

  let hasPageAccess = true;
  let hasFeatureAccess = true;

  if (requiredPageCode) {
    hasPageAccess = permissionService.hasPage(requiredPageCode);
  }

  if (requiredFeatureCode) {
    hasFeatureAccess = permissionService.hasFeature(requiredFeatureCode);
  }
  if (hasPageAccess && hasFeatureAccess) {
    return true;
  } else {
    return router.createUrlTree(['/access-denied']);
  }
};
