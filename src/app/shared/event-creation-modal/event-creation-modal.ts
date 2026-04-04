import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

@Component({
  selector: 'app-event-creation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-creation-modal.html',
  styleUrl: './event-creation-modal.css'
})
export class EventCreationModal {
  @Output() closed = new EventEmitter<void>();
  @Output() eventCreated = new EventEmitter<any>();

  event = { name: '', type: '', guests: '', location: '' };

  eventTypes = ['Wedding', 'Engagement', 'Birthday', 'Corporate', 'Anniversary', 'Other'];
  locations = ['Thrissur', 'Ernakulam', 'Kozhikode', 'Thiruvananthapuram', 'Palakkad', 'Other'];

  loading = false;
  error = '';

  constructor(
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  close() {
    this.closed.emit();
  }

  async createEvent() {
    if (!this.event.name || !this.event.type) {
      this.error = 'Event name and type are required!';
      return;
    }
    this.loading = true;
    try {
      const db = getFirestore();
      const uid = this.auth.currentUser()?.uid;
      const docRef = await addDoc(collection(db, 'events'), {
        ...this.event,
        userId: uid,
        createdAt: new Date()
      });
      const newEvent = { id: docRef.id, ...this.event };
      this.auth.setActiveEvent(newEvent);
      this.eventCreated.emit(newEvent);
      this.close();
    } catch (e) {
      this.error = 'Failed to create event. Try again.';
    }
    this.loading = false;
    this.cdr.detectChanges();
  }
}