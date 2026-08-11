import { TestBed } from '@angular/core/testing';

import { Features } from './features';

describe('Features', () => {
  let service: Features;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Features);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
