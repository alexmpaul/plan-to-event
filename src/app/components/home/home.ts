import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Categories } from '../categories/categories';
import { AuthService } from '../../services/auth';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Categories, Navbar],
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

  async planEvent() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/admin-login'], {
        queryParams: { intent: 'plan' }
      });
      return;
    }
    const events = await this.auth.getUserEvents();
    if (events.length === 0) {
      this.router.navigate(['/create-event']);
    } else {
      if (!this.auth.activeEvent()) {
        this.auth.setActiveEvent(events[0]);
      }
      this.router.navigate(['/vendors', events[0].id]);
    }
  }

  goToLogin() {
    this.router.navigate(['/admin-login'], {
      queryParams: { intent: 'login' }
    });
  }

  goToDashboard() {
    this.router.navigate(['/dashboard'], {
    });
  }

  async logout() {
    await this.auth.logout();
    this.cdr.detectChanges();
  }
}