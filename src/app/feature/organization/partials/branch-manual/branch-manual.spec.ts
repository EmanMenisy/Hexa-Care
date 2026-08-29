import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchManual } from './branch-manual';

describe('BranchManual', () => {
  let component: BranchManual;
  let fixture: ComponentFixture<BranchManual>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchManual]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchManual);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
