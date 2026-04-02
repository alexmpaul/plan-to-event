import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../services/api';
import { Categories } from '../categories/categories';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, Categories],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  categories: any[] = [];

  showModal = false;
  newCategory = { name: '', icon: '' };

  constructor(
    private api: Api,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
  }

  scrollToVendors() {
    document.getElementById('vendors-section')?.scrollIntoView({ behavior: 'smooth' });
  }
}