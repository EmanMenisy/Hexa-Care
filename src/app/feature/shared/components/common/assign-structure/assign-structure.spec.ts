import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignStructure } from './assign-structure';

describe('AssignStructure', () => {
  let component: AssignStructure;
  let fixture: ComponentFixture<AssignStructure>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignStructure]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignStructure);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
