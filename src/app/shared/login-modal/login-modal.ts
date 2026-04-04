import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.css'
})
export class LoginModal {
  @Output() closed = new EventEmitter<void>();
  @Output() loggedIn = new EventEmitter<void>();

  isLogin = true;
  error = '';
  loading = false;

  loginData = { email: '', password: '' };
  signupData = { firstName: '', lastName: '', phone: '', email: '', password: '' };

  constructor(
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.error = '';
    this.cdr.detectChanges();
  }

  close() {
    this.closed.emit();
  }

  async login() {
    if (!this.loginData.email || !this.loginData.password) {
      this.error = 'Please fill in all fields';
      return;
    }
    this.loading = true;
    try {
      await this.auth.login(this.loginData.email, this.loginData.password);
      this.loggedIn.emit();
      this.close();
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
      this.loggedIn.emit();
      this.close();
    } catch (e: any) {
      this.error = e.message || 'Signup failed';
    }
    this.loading = false;
    this.cdr.detectChanges();
  }
}