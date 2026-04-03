import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin {
  isLogin = true;

  loginData = { email: '', password: '' };
  signupData = { firstName: '', lastName: '', phone: '', email: '', password: '' };

  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.error = '';
    this.cdr.detectChanges();
  }

  close() {
    this.router.navigate(['/']);
  }

  async login() {
    if (!this.loginData.email || !this.loginData.password) {
      this.error = 'Please fill in all fields';
      return;
    }
    this.loading = true;
    try {
      await this.auth.login(this.loginData.email, this.loginData.password);
      this.router.navigate(['/']);
    } catch (e: any) {
      this.error = 'Invalid email or password';
    }
    this.loading = false;
    this.cdr.detectChanges();
  }

  async signup() {
    if (!this.signupData.firstName || !this.signupData.email || !this.signupData.password) {
      this.error = 'Please fill in all required fields';
      return;
    }
    this.loading = true;
    try {
      await this.auth.signup(
        this.signupData.email,
        this.signupData.password,
        this.signupData.firstName,
        this.signupData.lastName,
        this.signupData.phone
      );
      this.router.navigate(['/']);
    } catch (e: any) {
      this.error = e.message || 'Signup failed';
    }
    this.loading = false;
    this.cdr.detectChanges();
  }
}