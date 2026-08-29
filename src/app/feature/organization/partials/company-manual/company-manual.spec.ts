import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyManual } from './company-manual';

describe('CompanyManual', () => {
  let component: CompanyManual;
  let fixture: ComponentFixture<CompanyManual>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyManual]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyManual);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
