import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NativeListCell } from './native-list-cell';

describe('NativeListCell', () => {
  let component: NativeListCell;
  let fixture: ComponentFixture<NativeListCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NativeListCell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NativeListCell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
