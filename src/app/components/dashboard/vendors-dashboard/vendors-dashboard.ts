import { Component, Input, OnInit, OnChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { ApiService } from '../../../services/api';
import { getFirestore, collection, getDocs, query, where, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';

@Component({
  selector: 'app-vendors-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendors-dashboard.html',
  styleUrl: './vendors-dashboard.css'
})
export class VendorsDashboard implements OnInit, OnChanges {
  @Input() event: any = null;

  categories: any[] = [];
  wishlistedVendors: any[] = [];

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.loadData(); }
  ngOnChanges() { this.loadData(); }

  async loadData() {
    if (!this.event) return;
    await this.loadCategories();
    await this.loadWishlistedVendors();
  }

  loadCategories() {
    return new Promise<void>(resolve => {
      this.api.getCategories().subscribe({
        next: (cats) => { this.categories = cats; resolve(); }
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
    this.wishlistedVendors = snap.docs.map(d => ({ id: d.id, ...d.data(), editingPrice: false, tempPrice: d.data()['quotedPrice'] || '' }));
    this.cdr.detectChanges();
  }

  getVendorsByCategory(catId: string) {
    return this.wishlistedVendors.filter(v => v.catId === catId);
  }

  getSelectedVendor(catId: string) {
    return this.wishlistedVendors.find(v => v.catId === catId && v.booked);
  }

  isCategoryBooked(catId: string): boolean {
    return this.wishlistedVendors.some(v => v.catId === catId && v.booked);
  }

  isCategoryShortlisted(catId: string): boolean {
    return this.wishlistedVendors.some(v => v.catId === catId);
  }

  hasAnyFinalized(): boolean {
    return this.wishlistedVendors.some(v => v.booked);
  }

  getCategoryName(catId: string): string {
    return this.categories.find(c => c.id === catId)?.name || '';
  }

  goToVendors(catId: string) {
    this.router.navigate(['/vendors', catId]);
  }

  goToDetail(vendorId: string) {
    this.router.navigate(['/vendor', vendorId]);
  }

  async toggleBooked(vendor: any) {
    const db = getFirestore();
    const uid = this.auth.currentUser()?.uid;

    // Unbook all others in same category first
    const sameCat = this.getVendorsByCategory(vendor.catId);
    for (const v of sameCat) {
      if (v.id !== vendor.id && v.booked) {
        await setDoc(doc(db, 'wishlists', uid!, 'vendors', v.id), { ...v, booked: false, editingPrice: false, tempPrice: v.tempPrice });
        v.booked = false;
      }
    }

    const newBooked = !vendor.booked;
    await setDoc(doc(db, 'wishlists', uid!, 'vendors', vendor.id), { ...vendor, booked: newBooked, editingPrice: false, tempPrice: vendor.tempPrice });
    vendor.booked = newBooked;
    this.cdr.detectChanges();
  }

  async removeVendor(vendor: any) {
    if (!confirm('Remove this vendor from your list?')) return;
    const db = getFirestore();
    const uid = this.auth.currentUser()?.uid;
    await deleteDoc(doc(db, 'wishlists', uid!, 'vendors', vendor.id));
    this.wishlistedVendors = this.wishlistedVendors.filter(v => v.id !== vendor.id);
    this.cdr.detectChanges();
  }

  startEditPrice(vendor: any) {
    vendor.editingPrice = true;
    vendor.tempPrice = vendor.quotedPrice || vendor.price || '';
    this.cdr.detectChanges();
  }

  async savePrice(vendor: any) {
    const db = getFirestore();
    const uid = this.auth.currentUser()?.uid;
    await updateDoc(doc(db, 'wishlists', uid!, 'vendors', vendor.id), {
      quotedPrice: vendor.tempPrice
    });
    vendor.quotedPrice = vendor.tempPrice;
    vendor.editingPrice = false;
    this.cdr.detectChanges();
  }
}