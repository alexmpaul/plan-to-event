import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Vendors } from './vendors/vendors';
import { VendorDetails } from './vendor-details/vendor-details';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'vendors/:catId', component: Vendors },
  { path: 'vendor/:id', component: VendorDetails },
];