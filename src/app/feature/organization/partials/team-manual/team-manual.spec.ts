import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamManual } from './team-manual';

describe('TeamManual', () => {
  let component: TeamManual;
  let fixture: ComponentFixture<TeamManual>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamManual]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamManual);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
