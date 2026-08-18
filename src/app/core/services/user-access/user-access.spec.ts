import { TestBed } from '@angular/core/testing';

import { UserAccess } from './user-access';

describe('UserAccess', () => {
  let service: UserAccess;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserAccess);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
