import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HexaSubHeader } from './hexa-sub-header';

describe('HexaSubHeader', () => {
  let component: HexaSubHeader;
  let fixture: ComponentFixture<HexaSubHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HexaSubHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HexaSubHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
