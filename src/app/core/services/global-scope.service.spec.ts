import { TestBed } from '@angular/core/testing';

import { GlobalScopeService } from './global-scope.service';

describe('GlobalScopeService', () => {
  let service: GlobalScopeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalScopeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
