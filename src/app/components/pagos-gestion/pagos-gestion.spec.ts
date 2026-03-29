import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagosGestion } from './pagos-gestion';

describe('PagosGestion', () => {
  let component: PagosGestion;
  let fixture: ComponentFixture<PagosGestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagosGestion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagosGestion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
