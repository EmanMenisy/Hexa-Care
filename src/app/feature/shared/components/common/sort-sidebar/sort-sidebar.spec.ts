import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortSidebar } from './sort-sidebar';

describe('SortSidebar', () => {
  let component: SortSidebar;
  let fixture: ComponentFixture<SortSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SortSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
