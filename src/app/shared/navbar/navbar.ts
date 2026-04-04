import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { LoginModal } from '../login-modal/login-modal';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LoginModal],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  showSidebar = false;
  showLoginModal = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
    this.cdr.detectChanges();
  }

  closeSidebar() {
    this.showSidebar = false;
    this.cdr.detectChanges();
  }

  openLoginModal() {
    this.showLoginModal = true;
    this.cdr.detectChanges();
  }

  closeLoginModal() {
    this.showLoginModal = false;
    this.cdr.detectChanges();
  }

  onLoggedIn() {
    this.showLoginModal = false;
    this.cdr.detectChanges();
  }

  goToHome() {
    this.closeSidebar();
    this.router.navigate(['/']);
  }

  goToDashboard() {
    this.closeSidebar();
    this.router.navigate(['/dashboard']);
  }

  goToProfile() {
    this.closeSidebar();
    this.router.navigate(['/profile']);
  }

  async logout() {
    await this.auth.logout();
    this.closeSidebar();
    this.router.navigate(['/']);
    this.cdr.detectChanges();
  }

  getInitials(): string {
    const user = this.auth.currentUser();
    if (!user?.email) return '?';
    return user.email[0].toUpperCase();
  }

  getUserName(): string {
    const user = this.auth.currentUser();
    return user?.email?.split('@')[0] || '';
  }
}