import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { pageGuardGuard } from './page-guard-guard';

describe('pageGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => pageGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
