import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './budget.html',
  styleUrl: './budget.css'
})
export class Budget implements OnInit {
  @Input() event: any = null;

  ngOnInit() {}
}