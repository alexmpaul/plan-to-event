import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../services/api';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  categories: any[] = [];

  showModal = false;
  newCategory = { name: '', icon: '' };

  constructor(
    private api: Api,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.api.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error:', err)
    });
  }

  goToVendors(catId: string) {
    this.router.navigate(['/vendors', catId]);
  }

  scrollToVendors() {
    document.getElementById('vendors-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  openModal() {
    this.newCategory = { name: '', icon: '' };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.showModal = false;
    this.cdr.detectChanges();
  }

  saveCategory() {
    if (!this.newCategory.name) {
      alert('Category name is required!');
      return;
    }
    if (!this.newCategory.icon) {
      this.newCategory.icon = '📋';
    }
    this.api.addCategory(this.newCategory).subscribe({
      next: () => {
        this.closeModal();
        this.loadCategories();
      },
      error: (err) => console.error(err)
    });
  }
}