import { TestBed } from '@angular/core/testing';

import { Tarifas } from './tarifas';

describe('Tarifas', () => {
  let service: Tarifas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tarifas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
