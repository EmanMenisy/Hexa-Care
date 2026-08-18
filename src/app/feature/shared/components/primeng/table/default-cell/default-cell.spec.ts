import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultCell } from './default-cell';

describe('DefaultCell', () => {
  let component: DefaultCell;
  let fixture: ComponentFixture<DefaultCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultCell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefaultCell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
