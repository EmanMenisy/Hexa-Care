import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableLoading } from './table-loading';

describe('TableLoading', () => {
  let component: TableLoading;
  let fixture: ComponentFixture<TableLoading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableLoading]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableLoading);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
