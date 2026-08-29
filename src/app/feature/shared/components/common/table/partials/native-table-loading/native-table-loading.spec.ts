import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NativeTableLoading } from './native-table-loading';

describe('NativeTableLoading', () => {
  let component: NativeTableLoading;
  let fixture: ComponentFixture<NativeTableLoading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NativeTableLoading]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NativeTableLoading);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
