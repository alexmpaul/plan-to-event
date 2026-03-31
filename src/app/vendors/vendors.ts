import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../services/api';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendors.html',
  styleUrl: './vendors.css'
})
export class Vendors implements OnInit {
  vendors: any[] = [];
  category: any = null;
  catId: string = '';

  showModal = false;
  newVendor = {
    name: '', place: '', phone: '',
    email: '', instaId: '', price: '', rating: 0, notes: ''
  };

  constructor(
    private route: ActivatedRoute,
    private api: Api,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.catId = this.route.snapshot.paramMap.get('catId') || '';
    this.loadData();
  }

  loadData() {
    this.api.getCategories().subscribe({
      next: (cats) => {
        this.category = cats.find(c => c.id === this.catId);
        this.cdr.detectChanges();
      }
    });
    this.api.getVendors(this.catId).subscribe({
      next: (data) => {
        this.vendors = data;
        this.cdr.detectChanges();
      }
    });
  }

  goToDetail(vendorId: string) {
    this.router.navigate(['/vendor', vendorId]);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  openModal() {
    this.newVendor = { name: '', place: '', phone: '', email: '', instaId: '', price: '', rating: 0, notes: '' };
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
        this.loadData();
      },
      error: (err) => console.error(err)
    });
  }
}