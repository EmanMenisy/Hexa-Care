import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Premissions } from './premissions';

describe('Premissions', () => {
  let component: Premissions;
  let fixture: ComponentFixture<Premissions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Premissions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Premissions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
