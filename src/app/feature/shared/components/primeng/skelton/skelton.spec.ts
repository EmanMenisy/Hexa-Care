import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Skelton } from './skelton';

describe('Skelton', () => {
  let component: Skelton;
  let fixture: ComponentFixture<Skelton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Skelton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Skelton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
