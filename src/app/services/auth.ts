import { Injectable, signal } from '@angular/core';
import { FirebaseService } from './firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedIn = signal(false);
  isAdmin = signal(false);
  currentUser = signal<any>(null);

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
      } else {
        this.isLoggedIn.set(false);
        this.isAdmin.set(false);
        this.currentUser.set(null);
      }
    });
  }

  async login(email: string, password: string) {
    const user = await this.firebase.login(email, password);
    return user;
  }

  async signup(email: string, password: string, firstName: string, lastName: string, phone: string) {
    const user = await this.firebase.signup(email, password, firstName, lastName, phone);
    return user;
  }

  async logout() {
    await this.firebase.logout();
  }
}