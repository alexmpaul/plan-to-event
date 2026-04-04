import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCreation } from './event-creation';

describe('EventCreation', () => {
  let component: EventCreation;
  let fixture: ComponentFixture<EventCreation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCreation],
    }).compileComponents();

    fixture = TestBed.createComponent(EventCreation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
