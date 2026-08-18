import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateCell } from './date-cell';

describe('DateCell', () => {
  let component: DateCell;
  let fixture: ComponentFixture<DateCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateCell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateCell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
