import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Vendors } from './vendors/vendors';
import { VendorDetails } from './vendor-details/vendor-details';
import { Categories } from './categories/categories';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'categories', component: Categories },
  { path: 'vendors/:catId', component: Vendors },
  { path: 'vendor/:id', component: VendorDetails },
];