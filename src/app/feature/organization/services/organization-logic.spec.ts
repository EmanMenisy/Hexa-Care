import { TestBed } from '@angular/core/testing';

import { OrganizationLogic } from './organization-logic';

describe('OrganizationLogic', () => {
  let service: OrganizationLogic;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganizationLogic);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
