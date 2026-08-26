import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeCreation } from './employee-creation';

describe('EmployeeCreation', () => {
  let component: EmployeeCreation;
  let fixture: ComponentFixture<EmployeeCreation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeCreation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeCreation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
