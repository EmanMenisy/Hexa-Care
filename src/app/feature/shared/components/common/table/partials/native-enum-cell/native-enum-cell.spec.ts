import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NativeEnumCell } from './native-enum-cell';

describe('NativeEnumCell', () => {
  let component: NativeEnumCell;
  let fixture: ComponentFixture<NativeEnumCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NativeEnumCell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NativeEnumCell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
