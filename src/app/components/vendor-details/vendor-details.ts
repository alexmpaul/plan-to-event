import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { AuthService } from '../../services/auth';
import { Navbar } from '../../shared/navbar/navbar';
import { LoginModal } from '../../shared/login-modal/login-modal';
import { EventCreationModal } from '../../shared/event-creation-modal/event-creation-modal';
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';

@Component({
  selector: 'app-vendor-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, LoginModal, EventCreationModal],
  templateUrl: './vendor-details.html',
  styleUrl: './vendor-details.css'
})
export class VendorDetails implements OnInit {
  vendor: any = null;
  category: any = null;
  showEditModal = false;
  editVendor: any = {};
  editPhotosText = '';

  showLoginModal = false;
  showEventModal = false;
  isVendorAdded = false;
  wishlistDocId = '';

  activePhoto = 0;
  activeSection = '';

  constructor(
    private route: ActivatedRoute,
    private api: Api,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public auth: AuthService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.api.getVendor(id).subscribe({
      next: (data) => {
        this.vendor = data;
        this.loadAddedState();
        this.api.getCategories().subscribe({
          next: (cats) => {
            this.category = cats.find(c => c.id === data.catId);
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => console.error('Vendor error:', err)
    });
  }

  toggleSection(section: string) {
    this.activeSection = this.activeSection === section ? '' : section;
    this.cdr.detectChanges();
  }

  prevPhoto() {
    this.activePhoto = (this.activePhoto - 1 + this.vendor.photos.length) % this.vendor.photos.length;
    this.cdr.detectChanges();
  }

  nextPhoto() {
    this.activePhoto = (this.activePhoto + 1) % this.vendor.photos.length;
    this.cdr.detectChanges();
  }

  async loadAddedState() {
    const activeEvent = this.auth.activeEvent();
    if (!this.auth.isLoggedIn() || !activeEvent || !this.vendor) return;
    const db = getFirestore();
    const uid = this.auth.currentUser()?.uid;
    const q = query(
      collection(db, 'wishlists', uid!, 'vendors'),
      where('vendorId', '==', this.vendor.id),
      where('eventId', '==', activeEvent.id)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      this.isVendorAdded = true;
      this.wishlistDocId = snap.docs[0].id;
    }
    this.cdr.detectChanges();
  }

  async addVendor() {
    if (!this.auth.isLoggedIn()) {
      this.showLoginModal = true;
      this.cdr.detectChanges();
      return;
    }
    if (!this.auth.activeEvent()) {
      const events = await this.auth.getUserEvents();
      if (events.length === 0) {
        this.showEventModal = true;
      } else {
        this.auth.setActiveEvent(events[0]);
        await this.doAddVendor();
      }
      this.cdr.detectChanges();
      return;
    }
    await this.doAddVendor();
  }

  async doAddVendor() {
    const db = getFirestore();
    const uid = this.auth.currentUser()?.uid;
    const activeEvent = this.auth.activeEvent();

    if (this.isVendorAdded) {
      await deleteDoc(doc(db, 'wishlists', uid!, 'vendors', this.wishlistDocId));
      this.isVendorAdded = false;
      this.wishlistDocId = '';
      this.cdr.detectChanges();
      return;
    }

    const docRef = await addDoc(collection(db, 'wishlists', uid!, 'vendors'), {
      vendorId: this.vendor.id,
      eventId: activeEvent.id,
      name: this.vendor.name,
      place: this.vendor.place,
      phone: this.vendor.phone,
      catId: this.vendor.catId,
      price: this.vendor.price || ''
    });
    this.isVendorAdded = true;
    this.wishlistDocId = docRef.id;
    this.cdr.detectChanges();
  }

  async onLoggedIn() {
    this.showLoginModal = false;
    const events = await this.auth.getUserEvents();
    if (events.length === 0) {
      this.showEventModal = true;
    } else {
      this.auth.setActiveEvent(events[0]);
      await this.doAddVendor();
    }
    this.cdr.detectChanges();
  }

  async onEventCreated() {
    this.showEventModal = false;
    await this.doAddVendor();
    this.cdr.detectChanges();
  }

  goBack() {
    if (this.vendor) {
      this.router.navigate(['/vendors', this.vendor.catId]);
    }
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  deleteVendor() {
    if (confirm('Delete this vendor?')) {
      this.api.deleteVendor(this.vendor.id).subscribe(() => {
        this.goBack();
      });
    }
  }

  openEditModal() {
    this.editVendor = { ...this.vendor };
    this.editPhotosText = (this.vendor.photos || []).join('\n');
    this.showEditModal = true;
    this.cdr.detectChanges();
  }

  closeEditModal() {
    this.showEditModal = false;
    this.cdr.detectChanges();
  }

  saveEdit() {
    if (!this.editVendor.name || !this.editVendor.place || !this.editVendor.phone) {
      alert('Name, place and phone are required!');
      return;
    }
    const photos = this.editPhotosText
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .slice(0, 5);

    this.api.updateVendor(this.vendor.id, { ...this.editVendor, photos }).subscribe({
      next: (updated) => {
        this.vendor = updated;
        this.activePhoto = 0;
        this.closeEditModal();
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
}