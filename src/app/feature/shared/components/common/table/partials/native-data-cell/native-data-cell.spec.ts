import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NativeDataCell } from './native-data-cell';

describe('NativeDataCell', () => {
  let component: NativeDataCell;
  let fixture: ComponentFixture<NativeDataCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NativeDataCell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NativeDataCell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
