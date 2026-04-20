import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorsDashboard } from './vendors-dashboard';

describe('VendorsDashboard', () => {
  let component: VendorsDashboard;
  let fixture: ComponentFixture<VendorsDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorsDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(VendorsDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
