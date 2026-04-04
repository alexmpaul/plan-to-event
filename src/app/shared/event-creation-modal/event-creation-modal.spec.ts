import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCreationModal } from './event-creation-modal';

describe('EventCreationModal', () => {
  let component: EventCreationModal;
  let fixture: ComponentFixture<EventCreationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCreationModal],
    }).compileComponents();

    fixture = TestBed.createComponent(EventCreationModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
