import { TestBed } from '@angular/core/testing';

import { AssignStructure } from './assign-structure';

describe('AssignStructure', () => {
  let service: AssignStructure;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssignStructure);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
