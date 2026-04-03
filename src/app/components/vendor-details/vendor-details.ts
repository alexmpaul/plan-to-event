import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-vendor-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendor-details.html',
  styleUrl: './vendor-details.css'
})
export class VendorDetails implements OnInit {
  vendor: any = null;
  category: any = null;
  showEditModal = false;
  editVendor: any = {};

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

  goBack() {
    if (this.vendor) {
      this.router.navigate(['/vendors', this.vendor.catId]);
    }
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
    this.api.updateVendor(this.vendor.id, this.editVendor).subscribe({
      next: (updated) => {
        this.vendor = updated;
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