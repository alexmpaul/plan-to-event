import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Categories } from '../categories/categories';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Categories],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  constructor(
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  isLoggedIn() {
    return this.auth.isLoggedIn();
  }

  userName() {
    return this.auth.currentUser()?.email?.split('@')[0] || '';
  }

  scrollToVendors() {
    document.getElementById('vendors-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  goToLogin() {
    this.router.navigate(['/admin-login']);
  }

  async logout() {
    await this.auth.logout();
    this.cdr.detectChanges();
  }
}