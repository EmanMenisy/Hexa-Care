import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeCreationStepper } from './employee-creation-stepper';

describe('EmployeeCreationStepper', () => {
  let component: EmployeeCreationStepper;
  let fixture: ComponentFixture<EmployeeCreationStepper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeCreationStepper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeCreationStepper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
