import { Component, Input, OnInit, OnChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { getFirestore, collection, getDocs, query, where, addDoc, setDoc, doc, deleteDoc } from 'firebase/firestore';

@Component({
  selector: 'app-guestlist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guestlist.html',
  styleUrl: './guestlist.css'
})
export class Guestlist implements OnInit, OnChanges {
  @Input() event: any = null;

  guestCategories: any[] = [];
  activeGuestCat: any = null;
  guests: any[] = [];
  guestNotes = '';
  savingNotes = false;

  isLoading = true;
  editingCatId: string | null = null;
  editingCatName = '';

  constructor(
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.loadData(); }
  ngOnChanges() { this.loadData(); }

  async loadData() {
    if (!this.event) return;
    await this.loadGuestCategories();
    await this.loadGuestNotes();
  }

  async loadGuestCategories() {
    this.isLoading = true;
    const db = getFirestore();
    const uid = this.auth.currentUser()?.uid;
    const q = query(
      collection(db, 'guestCategories'),
      where('eventId', '==', this.event.id),
      where('userId', '==', uid)
    );
    const snap = await getDocs(q);
    this.guestCategories = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (this.guestCategories.length === 0) {
      const ref = await addDoc(collection(db, 'guestCategories'), {
        name: 'Family', eventId: this.event.id, userId: uid, limit: 0
      });
      this.guestCategories = [{ id: ref.id, name: 'Family', limit: 0 }];
    }

    this.activeGuestCat = this.guestCategories[0];
    await this.loadGuests();
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  startRenameCategory(cat: any) {
    this.editingCatId = cat.id;
    this.editingCatName = cat.name;
    this.cdr.detectChanges();
  }

  async saveRenameCategory(cat: any) {
    if (!this.editingCatName.trim()) return;
    const db = getFirestore();
    await setDoc(doc(db, 'guestCategories', cat.id), { ...cat, name: this.editingCatName.trim() });
    cat.name = this.editingCatName.trim();
    this.editingCatId = null;
    this.cdr.detectChanges();
  }

  async deleteGuestCategory(cat: any) {
    if (!confirm(`Delete "${cat.name}" category and all its guests?`)) return;
    const db = getFirestore();
    const uid = this.auth.currentUser()?.uid;

    // Delete all guests in this category
    const guestSnap = await getDocs(query(
      collection(db, 'guests'),
      where('catId', '==', cat.id),
      where('userId', '==', uid)
    ));
    for (const g of guestSnap.docs) {
      await deleteDoc(doc(db, 'guests', g.id));
    }

    // Delete category
    await deleteDoc(doc(db, 'guestCategories', cat.id));
    this.guestCategories = this.guestCategories.filter(c => c.id !== cat.id);

    // Switch to first remaining category
    if (this.guestCategories.length > 0) {
      this.activeGuestCat = this.guestCategories[0];
      await this.loadGuests();
    } else {
      this.activeGuestCat = null;
      this.guests = [];
    }
    this.cdr.detectChanges();
  }

  async addGuestCategory() {
    const name = prompt('Enter category name (e.g. Family, Friends):');
    if (!name) return;
    const db = getFirestore();
    const uid = this.auth.currentUser()?.uid;
    const ref = await addDoc(collection(db, 'guestCategories'), {
      name, eventId: this.event.id, userId: uid, limit: 0
    });
    const newCat = { id: ref.id, name, limit: 0 };
    this.guestCategories.push(newCat);
    this.activeGuestCat = newCat;
    this.guests = [];
    this.cdr.detectChanges();
  }

  async selectGuestCat(cat: any) {
    this.activeGuestCat = cat;
    await this.loadGuests();
  }

  async updateCatLimit(cat: any) {
    const db = getFirestore();
    await setDoc(doc(db, 'guestCategories', cat.id), cat);
    this.cdr.detectChanges();
  }

  // ── GUESTS ──
  async loadGuests() {
    if (!this.activeGuestCat) return;
    const db = getFirestore();
    const uid = this.auth.currentUser()?.uid;
    const q = query(
      collection(db, 'guests'),
      where('catId', '==', this.activeGuestCat.id),
      where('userId', '==', uid)
    );
    const snap = await getDocs(q);
    this.guests = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    this.cdr.detectChanges();
  }

  async addGuest() {
    const db = getFirestore();
    const uid = this.auth.currentUser()?.uid;
    const newGuest = {
      name: '', place: '', total: 0, expected: 0,
      contact: '', invited: false, remarks: '',
      catId: this.activeGuestCat.id, userId: uid
    };
    const ref = await addDoc(collection(db, 'guests'), newGuest);
    this.guests.push({ id: ref.id, ...newGuest });
    this.cdr.detectChanges();
  }

  async saveGuest(guest: any) {
    const db = getFirestore();
    const { id, ...data } = guest;
    await setDoc(doc(db, 'guests', id), data);
    this.cdr.detectChanges();
  }

  async toggleInvited(guest: any) {
    guest.invited = !guest.invited;
    await this.saveGuest(guest);
  }

  async deleteGuest(guest: any) {
    const db = getFirestore();
    await deleteDoc(doc(db, 'guests', guest.id));
    this.guests = this.guests.filter(g => g.id !== guest.id);
    this.cdr.detectChanges();
  }

  // ── TOTALS ──
  getTotalGuests() {
    return this.guests.reduce((sum, g) => sum + (parseInt(g.total) || 0), 0);
  }

  getExpectedGuests() {
    return this.guests.reduce((sum, g) => sum + (parseInt(g.expected) || 0), 0);
  }

  getInvitedCount() {
    return this.guests.filter(g => g.invited).length;
  }

  getAllTotals() {
    return this.guestCategories.reduce((sum, cat) => sum + (cat.limit || 0), 0);
  }

  // ── NOTES ──
  async loadGuestNotes() {
    const db = getFirestore();
    const uid = this.auth.currentUser()?.uid;
    const snap = await getDocs(query(
      collection(db, 'guestNotes'),
      where('eventId', '==', this.event.id),
      where('userId', '==', uid)
    ));
    this.guestNotes = snap.empty ? '' : snap.docs[0].data()['notes'] || '';
    this.cdr.detectChanges();
  }

  async saveGuestNotes() {
    this.savingNotes = true;
    const db = getFirestore();
    const uid = this.auth.currentUser()?.uid;
    const snap = await getDocs(query(
      collection(db, 'guestNotes'),
      where('eventId', '==', this.event.id),
      where('userId', '==', uid)
    ));
    if (!snap.empty) {
      await setDoc(doc(db, 'guestNotes', snap.docs[0].id), {
        notes: this.guestNotes, eventId: this.event.id, userId: uid
      });
    } else {
      await addDoc(collection(db, 'guestNotes'), {
        notes: this.guestNotes, eventId: this.event.id, userId: uid
      });
    }
    this.savingNotes = false;
    this.cdr.detectChanges();
  }
}