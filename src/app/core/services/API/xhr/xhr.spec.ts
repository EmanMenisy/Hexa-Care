import { TestBed } from '@angular/core/testing';

import { Xhr } from './xhr';

describe('Xhr', () => {
  let service: Xhr;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Xhr);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
