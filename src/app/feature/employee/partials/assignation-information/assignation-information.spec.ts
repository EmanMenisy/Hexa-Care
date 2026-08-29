import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignationInformation } from './assignation-information';


describe('AssignationInformation', () => {
  let component: AssignationInformation;
  let fixture: ComponentFixture<AssignationInformation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignationInformation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignationInformation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
