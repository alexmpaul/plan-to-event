import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Navbar } from '../../shared/navbar/navbar';
import { Overview } from './overview/overview';
import { Guestlist } from './guestlist/guestlist';
import { Budget } from './budget/budget';
import { VendorsDashboard } from './vendors-dashboard/vendors-dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Navbar, Overview, VendorsDashboard, Guestlist, Budget],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  events: any[] = [];
  activeEvent: any = null;
  activeTab: 'overview' | 'vendors' | 'guestlist' | 'budget' = 'overview';

  constructor(
    public auth: AuthService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }
    this.events = this.auth.userEvents();
    this.activeEvent = this.auth.activeEvent() || this.events[0];
    this.cdr.detectChanges();
  }

  switchEventByIndex(index: number) {
    const event = this.events[index];
    if (event) {
      this.activeEvent = event;
      this.auth.setActiveEvent(event);
      this.cdr.detectChanges();
    }
  }

  switchTab(tab: 'overview' | 'vendors' | 'guestlist' | 'budget') {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  goHome() {
    this.router.navigate(['/']);
  }
}