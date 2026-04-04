import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

@Component({
  selector: 'app-event-creation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-creation.html',
  styleUrl: './event-creation.css'
})
export class EventCreation {
  event = {
    name: '',
    type: '',
    guests: '',
    location: ''
  };

  eventTypes = [
    'Wedding', 'Engagement', 'Birthday', 
    'Corporate', 'Anniversary', 'Other'
  ];

  locations = [
    'Thrissur', 'Ernakulam', 'Kozhikode',
    'Thiruvananthapuram', 'Palakkad', 'Other'
  ];

  loading = false;
  error = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  close() {
    this.router.navigate(['/']);
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

      this.router.navigate(['/vendors', 'cat1']);
    } catch (e) {
      this.error = 'Failed to create event. Try again.';
    }
    this.loading = false;
    this.cdr.detectChanges();
  }
}