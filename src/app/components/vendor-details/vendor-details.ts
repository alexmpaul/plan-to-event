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
  selectedPhotos: File[] = [];
  photoPreviewUrls: string[] = [];
  existingPhotos: string[] = [];
  uploadingPhotos = false;

  editingDescription = false;
  editingInclusions = false;
  tempDescription = '';
  tempInclusions = '';

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

  closeEditModal() {
    this.showEditModal = false;
    this.cdr.detectChanges();
  }

  onPhotosSelected(event: any) {
    const files: FileList = event.target.files;
    const maxSize = 2 * 1024 * 1024;
    const totalAllowed = 3 - this.existingPhotos.length;

    for (let i = 0; i < files.length; i++) {
      if (this.selectedPhotos.length >= totalAllowed) {
        alert('Maximum 3 photos allowed');
        break;
      }
      if (files[i].size > maxSize) {
        alert(`${files[i].name} exceeds 2MB limit`);
        continue;
      }
      this.selectedPhotos.push(files[i]);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreviewUrls.push(e.target.result);
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(files[i]);
    }
    this.cdr.detectChanges();
  }

  removeExistingPhoto(index: number) {
    this.existingPhotos.splice(index, 1);
    this.cdr.detectChanges();
  }

  removeNewPhoto(index: number) {
    this.selectedPhotos.splice(index, 1);
    this.photoPreviewUrls.splice(index, 1);
    this.cdr.detectChanges();
  }

  openEditModal() {
    this.editVendor = { ...this.vendor };
    this.existingPhotos = [...(this.vendor.photos || [])];
    this.selectedPhotos = [];
    this.photoPreviewUrls = [];
    this.showEditModal = true;
    this.cdr.detectChanges();
  }

  async saveEdit() {
    if (!this.editVendor.name || !this.editVendor.place || !this.editVendor.phone) {
      alert('Name, place and phone are required!');
      return;
    }

    this.uploadingPhotos = true;
    let newPhotoUrls: string[] = [];

    if (this.selectedPhotos.length > 0) {
      try {
        const response = await this.api.uploadPhotos(this.selectedPhotos).toPromise();
        newPhotoUrls = response?.urls || [];
      } catch (e) {
        alert('Failed to upload photos.');
        this.uploadingPhotos = false;
        return;
      }
    }

    const photos = [...this.existingPhotos, ...newPhotoUrls].slice(0, 3);

    this.api.updateVendor(this.vendor.id, { ...this.editVendor, photos }).subscribe({
      next: (updated) => {
        this.vendor = updated;
        this.activePhoto = 0;
        this.closeEditModal();
        this.uploadingPhotos = false;
        this.cdr.detectChanges();
      },
      error: () => { this.uploadingPhotos = false; }
    });
  }

  startEditDescription() {
    this.tempDescription = this.vendor.description || '';
    this.editingDescription = true;
    this.cdr.detectChanges();
  }

  async saveDescription() {
    this.api.updateVendor(this.vendor.id, { 
      ...this.vendor, 
      description: this.tempDescription 
    }).subscribe({
      next: (updated) => {
        this.vendor = updated;
        this.editingDescription = false;
        this.cdr.detectChanges();
      }
    });
  }

  startEditInclusions() {
    this.tempInclusions = this.vendor.inclusions || '';
    this.editingInclusions = true;
    this.cdr.detectChanges();
  }

  async saveInclusions() {
    this.api.updateVendor(this.vendor.id, { 
      ...this.vendor, 
      inclusions: this.tempInclusions 
    }).subscribe({
      next: (updated) => {
        this.vendor = updated;
        this.editingInclusions = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
}