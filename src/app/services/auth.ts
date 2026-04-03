import { Injectable, signal } from '@angular/core';
import { FirebaseService } from './firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedIn = signal(false);
  isAdmin = signal(false);
  currentUser = signal<any>(null);
  userEvents = signal<any[]>([]);
  activeEvent = signal<any>(null);
  isAuthReady = signal(false);

  constructor(private firebase: FirebaseService) {
    const auth = getAuth();
    const db = getFirestore();

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const role = userDoc.data()?.['role'];
        this.isLoggedIn.set(true);
        this.isAdmin.set(role === 'admin');
        this.currentUser.set(user);

        // Real-time listener for user events
        const q = query(
          collection(db, 'events'),
          where('userId', '==', user.uid)
        );
        onSnapshot(q, (snap) => {
          const events = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          this.userEvents.set(events);

          // Restore active event
          const stored = sessionStorage.getItem('activeEvent');
          if (stored) {
            const parsed = JSON.parse(stored);
            const found = events.find(e => e.id === parsed.id);
            this.activeEvent.set(found || events[0] || null);
          } else if (events.length > 0) {
            this.activeEvent.set(events[0]);
            sessionStorage.setItem('activeEvent', JSON.stringify(events[0]));
          }
        });

      } else {
        this.isLoggedIn.set(false);
        this.isAdmin.set(false);
        this.currentUser.set(null);
        this.userEvents.set([]);
        this.activeEvent.set(null);
      }
      this.isAuthReady.set(true);
    });
  }

  async login(email: string, password: string) {
    return this.firebase.login(email, password);
  }

  async signup(email: string, password: string, firstName: string, lastName: string, phone: string) {
    return this.firebase.signup(email, password, firstName, lastName, phone);
  }

  async logout() {
    sessionStorage.removeItem('activeEvent');
    await this.firebase.logout();
  }

  async getUserEvents(): Promise<any[]> {
    return this.firebase.getUserEvents();
  }

  setActiveEvent(event: any) {
    this.activeEvent.set(event);
    sessionStorage.setItem('activeEvent', JSON.stringify(event));
  }
}