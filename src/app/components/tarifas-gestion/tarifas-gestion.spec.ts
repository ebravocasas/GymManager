import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarifasGestion } from './tarifas-gestion';

describe('TarifasGestion', () => {
  let component: TarifasGestion;
  let fixture: ComponentFixture<TarifasGestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarifasGestion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TarifasGestion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
