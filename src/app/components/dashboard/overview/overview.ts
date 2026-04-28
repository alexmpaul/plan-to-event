import { Component, Input, OnInit, OnChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { ApiService } from '../../../services/api';
import { getFirestore, collection, getDocs, query, where, addDoc, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { FirebaseService } from '../../../services/firebase';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './overview.html',
  styleUrl: './overview.css'
})
export class Overview implements OnInit, OnChanges {
  @Input() event: any = null;

  categories: any[] = [];
  wishlistedVendors: any[] = [];
  tasks: any[] = [];
  newTaskName = '';
  newTaskDue = '';
  dashboardNotes = '';
  savingNotes = false;
  totalGuests = 0;
  totalInvited = 0;
  totalExpected = 0;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnChanges() {
    this.loadData();
  }

  async loadData() {
    if (!this.event) return;
    await this.loadCategories();
    await Promise.all([
      this.loadWishlistedVendors(),
      this.loadTasks(),
      this.loadNotes(),
      this.loadGuestTotals()
    ]);
    this.cdr.detectChanges();
  }

  loadCategories() {
    return new Promise<void>(resolve => {
      this.api.getCategories().subscribe({
        next: (cats) => {
          console.log('categories loaded:', cats);
          this.categories = cats;
          resolve();
        }
      });
    });
  }

  async loadWishlistedVendors() {
    const db = getFirestore();
    const uid = this.auth.currentUser()?.uid;
    const q = query(
      collection(db, 'wishlists', uid!, 'vendors'),
      where('eventId', '==', this.event.id)
    );
    const snap = await getDocs(q);
    this.wishlistedVendors = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    this.cdr.detectChanges();
  }

  isCategoryBooked(catId: string): boolean {
    return this.wishlistedVendors.some(v => v.catId === catId && v.booked);
  }

  isCategoryShortlisted(catId: string): boolean {
    return this.wishlistedVendors.some(v => v.catId === catId);
  }

  getCategoryIcon(catId: string): string {
    return this.categories.find(c => c.id === catId)?.icon || '📋';
  }

  // ── TASKS ──
  async loadTasks() {
    const db = getFirestore();
    const uid = this.auth.currentUser()?.uid;
    const q = query(
      collection(db, 'tasks'),
      where('eventId', '==', this.event.id),
      where('userId', '==', uid)
    );
    const snap = await getDocs(q);
    this.tasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    this.cdr.detectChanges();
  }

  async addTask() {
    if (!this.newTaskName.trim()) return;
    const db = getFirestore();
    const uid = this.auth.currentUser()?.uid;
    const ref = await addDoc(collection(db, 'tasks'), {
      name: this.newTaskName.trim(),
      eventId: this.event.id,
      userId: uid,
      completed: false,
      dueDate: this.newTaskDue || ''
    });
    this.tasks.push({
      id: ref.id,
      name: this.newTaskName.trim(),
      completed: false,
      dueDate: this.newTaskDue || ''
    });
    this.newTaskName = '';
    this.newTaskDue = '';
    this.cdr.detectChanges();
  }

  async toggleTask(task: any) {
    const db = getFirestore();
    await setDoc(doc(db, 'tasks', task.id), { ...task, completed: !task.completed });
    task.completed = !task.completed;
    this.cdr.detectChanges();
  }

  async deleteTask(task: any) {
    const db = getFirestore();
    await deleteDoc(doc(db, 'tasks', task.id));
    this.tasks = this.tasks.filter(t => t.id !== task.id);
    this.cdr.detectChanges();
  }

  // ── NOTES ──
  async loadNotes() {
    const db = getFirestore();
    const uid = this.auth.currentUser()?.uid;
    const snap = await getDocs(query(
      collection(db, 'dashboardNotes'),
      where('eventId', '==', this.event.id),
      where('userId', '==', uid)
    ));
    this.dashboardNotes = snap.empty ? '' : snap.docs[0].data()['notes'] || '';
    this.cdr.detectChanges();
  }

  async saveNotes() {
    this.savingNotes = true;
    const db = getFirestore();
    const uid = this.auth.currentUser()?.uid;
    const snap = await getDocs(query(
      collection(db, 'dashboardNotes'),
      where('eventId', '==', this.event.id),
      where('userId', '==', uid)
    ));
    if (!snap.empty) {
      await setDoc(doc(db, 'dashboardNotes', snap.docs[0].id), {
        notes: this.dashboardNotes, eventId: this.event.id, userId: uid
      });
    } else {
      await addDoc(collection(db, 'dashboardNotes'), {
        notes: this.dashboardNotes, eventId: this.event.id, userId: uid
      });
    }
    this.savingNotes = false;
    this.cdr.detectChanges();
  }

  async loadGuestTotals() {
    const uid = this.auth.currentUser()?.uid;
    const totals = await this.firebaseService.getGuestTotals(this.event.id, uid!);
    this.totalGuests = totals['total'] || 0;
    this.totalInvited = totals['invited'] || 0;
    this.totalExpected = totals['expected'] || 0;
    this.cdr.detectChanges();
}
}