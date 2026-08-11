import { TestBed } from '@angular/core/testing';

import { Localization } from './localization';

describe('Localization', () => {
  let service: Localization;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Localization);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
