import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Vendors } from './components/vendors/vendors';
import { VendorDetails } from './components/vendor-details/vendor-details';
import { Categories } from './components/categories/categories';
import { AdminLogin } from './admin-login/admin-login';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'categories', component: Categories },
  { path: 'vendors/:catId', component: Vendors },
  { path: 'vendor/:id', component: VendorDetails },
  { path: 'admin-login', component: AdminLogin },
];