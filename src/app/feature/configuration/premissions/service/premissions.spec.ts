import { TestBed } from '@angular/core/testing';

import { premissionService } from './premissions';

describe('Premissions', () => {
  let service: premissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(premissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
