import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxNumberTickerComponent } from '@omnedia/ngx-number-ticker';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [
    CommonModule,
    NgxNumberTickerComponent,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent {
  heroWords = ['Digital Solutions for Medical Cabinets', 'Modernize Your Practice Management', 'Streamline Patient Care Operations'];
  
  doctorCount = 1240;
  patientCount = 85600;
  appointmentCount = 124500;

  formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}