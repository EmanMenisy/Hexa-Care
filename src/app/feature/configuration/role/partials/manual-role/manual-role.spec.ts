import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualRole } from './manual-role';

describe('ManualRole', () => {
  let component: ManualRole;
  let fixture: ComponentFixture<ManualRole>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualRole]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualRole);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
