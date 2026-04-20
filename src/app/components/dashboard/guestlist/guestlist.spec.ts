import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Guestlist } from './guestlist';

describe('Guestlist', () => {
  let component: Guestlist;
  let fixture: ComponentFixture<Guestlist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Guestlist],
    }).compileComponents();

    fixture = TestBed.createComponent(Guestlist);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
