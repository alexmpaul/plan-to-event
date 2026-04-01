import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Api {
  private base = 'https://plan-to-event-production.up.railway.app/api';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/categories`);
  }

  addCategory(cat: any): Observable<any> {
    return this.http.post(`${this.base}/categories`, cat);
  }

  getVendors(catId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/vendors?catId=${catId}`);
  }

  getVendor(id: string): Observable<any> {
    return this.http.get<any>(`${this.base}/vendors/${id}`);
  }

  addVendor(vendor: any): Observable<any> {
    return this.http.post(`${this.base}/vendors`, vendor);
  }

  updateVendor(id: string, vendor: any): Observable<any> {
    return this.http.put(`${this.base}/vendors/${id}`, vendor);
  }

  deleteVendor(id: string): Observable<any> {
    return this.http.delete(`${this.base}/vendors/${id}`);
  }
}