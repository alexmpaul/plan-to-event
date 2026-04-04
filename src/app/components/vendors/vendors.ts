import { Component, OnInit, ChangeDetectorRef, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { AuthService } from '../../services/auth';
import { FirebaseService } from '../../services/firebase';
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';

@Component({  
  selector: 'app-vendors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendors.html',
  styleUrl: './vendors.css'
})
export class Vendors implements OnInit {
  vendors: any[] = [];
  categories: any[] = [];
  category: any = null;
  catId: string = '';
  addedVendors: Map<string, string> = new Map(); // vendorId -> wishlistDocId

  showModal = false;
  newVendor = {
    name: '', place: '', phone: '',
    email: '', price: '', rating: 0,
    notes: '', instaId: ''
  };

  constructor(
    private route: ActivatedRoute,
    private api: Api,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public auth: AuthService,
    private firebase: FirebaseService
  ) {
    effect(() => {
      const event = this.auth.activeEvent();
      if (event) this.loadAddedVendors();
    });
  }

  ngOnInit() {
    // Get catId from route or session
    this.catId = this.route.snapshot.paramMap.get('catId') || 
                 sessionStorage.getItem('activeCatId') || '';
    
    this.loadCategories();
  }

  loadCategories() {
    this.api.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;

        // Select first category by default if none selected
        if (!this.catId && cats.length > 0) {
          this.catId = cats[0].id;
        }

        this.category = cats.find(c => c.id === this.catId) || cats[0];
        this.catId = this.category?.id || '';

        // Save to session
        sessionStorage.setItem('activeCatId', this.catId);

        this.loadVendors();
        this.cdr.detectChanges();
      }
    });
  }

  loadVendors() {
    if (!this.catId) return;
    this.api.getVendors(this.catId).subscribe({
      next: (data) => {
        this.vendors = data;
        this.loadAddedVendors();
        this.cdr.detectChanges();
      }
    });
  }

  async loadAddedVendors() {
    const activeEvent = this.auth.activeEvent();
    if (!this.auth.isLoggedIn() || !activeEvent) return;
    const db = getFirestore();
    const uid = this.auth.currentUser()?.uid;
    const q = query(
      collection(db, 'wishlists', uid!, 'vendors'),
      where('eventId', '==', activeEvent.id)
    );
    const snap = await getDocs(q);
    this.addedVendors.clear();
    snap.docs.forEach(d => this.addedVendors.set(d.data()['vendorId'], d.id));
    this.cdr.detectChanges();
  }

  createEvent() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/admin-login'], {
        queryParams: { intent: 'new' }
      });
      return;
    }
    this.router.navigate(['/create-event']);
  }

  isAdded(vendorId: string): boolean {
    return this.addedVendors.has(vendorId);
  }

  async addVendor(vendor: any) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/admin-login'], {
        queryParams: {
          intent: 'add',
          vendorUrl: encodeURIComponent(this.router.url)
        }
      });
      return;
    }
    
    if (!this.auth.activeEvent()) {
      const events = await this.auth.getUserEvents();
      if (events.length === 0) {
        this.router.navigate(['/create-event']);
      } else {
        this.auth.setActiveEvent(events[0]);
      }
      return;
    }

    const db = getFirestore();
    const uid = this.auth.currentUser()?.uid;
    const activeEvent = this.auth.activeEvent();

    if (this.isAdded(vendor.id)) {
      const wishlistDocId = this.addedVendors.get(vendor.id)!;
      await deleteDoc(doc(db, 'wishlists', uid!, 'vendors', wishlistDocId));
      this.addedVendors.delete(vendor.id);
      this.cdr.detectChanges();
      return;
    }

    const docRef = await addDoc(collection(db, 'wishlists', uid!, 'vendors'), {
      vendorId: vendor.id,
      eventId: activeEvent.id,
      name: vendor.name,
      place: vendor.place,
      phone: vendor.phone,
      catId: vendor.catId,
      price: vendor.price || ''
    });
    this.addedVendors.set(vendor.id, docRef.id);
    this.cdr.detectChanges();
  }

  switchEvent(index: number) {
    const events = this.auth.userEvents();
    if (events[index]) {
      this.auth.setActiveEvent(events[index]);
      this.addedVendors.clear();
      this.loadAddedVendors();
    }
  }

  selectCategory(catId: string) {
    this.catId = catId;
    this.category = this.categories.find(c => c.id === catId);
    sessionStorage.setItem('activeCatId', catId);
    this.loadVendors();
  }

  goToDetail(vendorId: string) {
    this.router.navigate(['/vendor', vendorId]);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  openModal() {
    this.newVendor = { name: '', place: '', phone: '', email: '', price: '', rating: 0, notes: '', instaId: '' };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.showModal = false;
    this.cdr.detectChanges();
  }

  saveVendor() {
    if (!this.newVendor.name || !this.newVendor.place || !this.newVendor.phone) {
      alert('Name, place and phone are required!');
      return;
    }
    const vendor = { ...this.newVendor, catId: this.catId };
    this.api.addVendor(vendor).subscribe({
      next: () => {
        this.closeModal();
        this.loadVendors();
      }
    });
  }
}