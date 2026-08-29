import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeEmployeeCreation } from '././home-employee-creation';

describe('HomeEmployeeCreation', () => {
  let component: HomeEmployeeCreation;
  let fixture: ComponentFixture<HomeEmployeeCreation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeEmployeeCreation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeEmployeeCreation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
