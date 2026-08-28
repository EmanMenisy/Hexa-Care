import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionalInformation } from './professional-information';

describe('ProfessionalInformation', () => {
  let component: ProfessionalInformation;
  let fixture: ComponentFixture<ProfessionalInformation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalInformation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessionalInformation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
