import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentManual } from './department-manual';

describe('DepartmentManual', () => {
  let component: DepartmentManual;
  let fixture: ComponentFixture<DepartmentManual>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentManual]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentManual);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
