import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { VendorsList } from './components/vendors-list/vendors';
import { VendorDetails } from './components/vendor-details/vendor-details';
import { Categories } from './components/categories/categories';
import { AdminLogin } from './components/admin-login/admin-login';
import { EventCreation } from './components/event-creation/event-creation';
import { Dashboard } from './components/dashboard/dashboard';
import { VendorsDashboard } from './components/dashboard/vendors-dashboard/vendors-dashboard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'categories', component: Categories },
  { path: 'vendors/:catId', component: VendorsList },
  { path: 'vendor/:id', component: VendorDetails },
  { path: 'admin-login', component: AdminLogin },
  { path: 'create-event', component: EventCreation },
  { path: 'dashboard', component: Dashboard },
  { path: 'dashboard-vendors', component: VendorsDashboard },
];