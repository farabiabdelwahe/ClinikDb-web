import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Users, Layers, DollarSign, Database, BarChart3, Settings } from 'lucide-angular';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface Feature {
  icon: any;
  title: string;
  description: string;
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, MatCardModule, MatIconModule],
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent {
  features: Feature[] = [
    {
      icon: Users,
      title: 'Patient Management',
      description: 'Comprehensive patient records with medical history, treatment plans, prescriptions, and appointment tracking in one secure platform.'
    },
    {
      icon: Layers,
      title: 'Appointment Scheduling',
      description: 'Smart scheduling system with automated reminders, online booking, and calendar synchronization for optimal time management.'
    },
    {
      icon: DollarSign,
      title: 'Billing & Insurance',
      description: 'Integrated billing system with insurance claim processing, payment tracking, and automated invoicing for streamlined finances.'
    },
    {
      icon: Database,
      title: 'Electronic Health Records',
      description: 'Secure, HIPAA-compliant digital records with easy access to patient data, lab results, and medical imaging.'
    },
    {
      icon: BarChart3,
      title: 'Practice Analytics',
      description: 'Real-time insights into practice performance, patient demographics, treatment outcomes, and financial metrics.'
    },
    {
      icon: Settings,
      title: 'Treatment Protocols',
      description: 'Customizable treatment templates, prescription management, and clinical decision support tools for better patient care.'
    }
  ];

  trackByTitle(index: number, feature: Feature): string {
    return feature.title;
  }
}