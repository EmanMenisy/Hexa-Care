import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectorPage } from './sector-page';

describe('SectorPage', () => {
  let component: SectorPage;
  let fixture: ComponentFixture<SectorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectorPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
