import { NativeDefaultCell } from './../native-default-cell/native-default-cell';
import { ComponentFixture, TestBed } from '@angular/core/testing';


describe('NativeDefultCell', () => {
  let component: NativeDefaultCell;
  let fixture: ComponentFixture<NativeDefaultCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NativeDefaultCell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NativeDefaultCell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
