import { Component, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

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
    private route: ActivatedRoute,
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
      const intent = this.route.snapshot.queryParams['intent'];
      const vendorUrl = this.route.snapshot.queryParams['vendorUrl'];

      if (intent === 'plan') {
        // Came from Plan your Event
        const events = await this.auth.getUserEvents();
        if (events.length === 0) {
          this.router.navigate(['/create-event']);
        } else {
          this.auth.setActiveEvent(events[0]);
          this.router.navigate(['/vendors', events[0].id]);
        }
      } else if (intent === 'new') {
        // Came from Create Event button
        this.router.navigate(['/create-event']);
      } else if (intent === 'add') {
        // Came from Add button
        const events = await this.auth.getUserEvents();
        if (events.length === 0) {
          this.router.navigate(['/create-event']);
        } else {
          this.auth.setActiveEvent(events[0]);
          if (vendorUrl) {
            this.router.navigateByUrl(decodeURIComponent(vendorUrl));
          } else {
            this.router.navigate(['/vendors', events[0].id]);
          }
        }
      } else if (intent === 'login' || !intent) {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'];
          if (returnUrl) {
            this.router.navigateByUrl(returnUrl);
          } else {
            this.router.navigate(['/']);
          }
      }
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