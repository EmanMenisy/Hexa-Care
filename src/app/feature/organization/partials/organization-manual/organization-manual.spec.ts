import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationManual } from './organization-manual';

describe('OrganizationManual', () => {
  let component: OrganizationManual;
  let fixture: ComponentFixture<OrganizationManual>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationManual]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationManual);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
