import { TestBed } from '@angular/core/testing';

import { XhrSocket } from './xhr-socket';

describe('XhrSocket', () => {
  let service: XhrSocket;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XhrSocket);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
