import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnumCell } from './enum-cell';

describe('EnumCell', () => {
  let component: EnumCell;
  let fixture: ComponentFixture<EnumCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnumCell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnumCell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
