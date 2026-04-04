import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDPSjt6NMINf516TxtTKQbpoWkyvU4x6hg",
  authDomain: "plantoevent-62f6c.firebaseapp.com",
  projectId: "plantoevent-62f6c",
  storageBucket: "plantoevent-62f6c.firebasestorage.app",
  messagingSenderId: "862999223640",
  appId: "1:862999223640:web:6df27074295aaaf17bd92d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  currentUser: User | null = null;
  isAdmin = false;

  constructor() {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const role = userDoc.data()?.['role'];
        this.isAdmin = role === 'admin';
      } else {
        this.isAdmin = false;
      }
    });
  }

  // ── AUTH ──
  async signup(email: string, password: string, firstName: string, lastName: string, phone: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', cred.user.uid), {
      firstName, lastName, phone, email, role: 'user'
    });
    return cred.user;
  }

  async login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
    this.isAdmin = userDoc.data()?.['role'] === 'admin';
    return cred.user;
  }

  async logout() {
    await signOut(auth);
    this.isAdmin = false;
    this.currentUser = null;
  }

  // ── WISHLIST ──
  async addToWishlist(vendor: any) {
    const uid = this.currentUser?.uid;
    if (!uid) return;
    await addDoc(collection(db, 'wishlists', uid, 'vendors'), vendor);
  }

  async getWishlist() {
    const uid = this.currentUser?.uid;
    if (!uid) return [];
    const snap = await getDocs(collection(db, 'wishlists', uid, 'vendors'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async removeFromWishlist(wishlistId: string) {
    const uid = this.currentUser?.uid;
    if (!uid) return;
    await deleteDoc(doc(db, 'wishlists', uid, 'vendors', wishlistId));
  }

  async isWishlisted(vendorId: string): Promise<boolean> {
    const uid = this.currentUser?.uid;
    if (!uid) return false;
    const q = query(collection(db, 'wishlists', uid, 'vendors'), where('id', '==', vendorId));
    const snap = await getDocs(q);
    return !snap.empty;
  }

  async getUserEvents(): Promise<any[]> {
  const uid = this.currentUser?.uid;
  if (!uid) return [];
  const q = query(collection(db, 'events'), where('userId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
}