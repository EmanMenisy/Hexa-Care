import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationProfile } from './organization-profile';

describe('OrganizationProfile', () => {
  let component: OrganizationProfile;
  let fixture: ComponentFixture<OrganizationProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
