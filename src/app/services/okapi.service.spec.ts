import { TestBed } from '@angular/core/testing';

import { OkapiService } from './okapi.service';

describe('OkapiService', () => {
  let service: OkapiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OkapiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
