import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  number: number;
  title: string;
  description: string;
}

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss']
})
export class HowItWorksComponent {
  steps: Step[] = [
    {
      number: 1,
      title: 'Sign Up & Set Up',
      description: 'Create your medical cabinet account and configure your practice profile with specialties, services, and team members.'
    },
    {
      number: 2,
      title: 'Import Patient Data',
      description: 'Securely import existing patient records or start fresh. Our HIPAA-compliant system ensures data safety and privacy.'
    },
    {
      number: 3,
      title: 'Configure Workflows',
      description: 'Set up appointment types, treatment protocols, billing preferences, and automated reminders tailored to your practice.'
    },
    {
      number: 4,
      title: 'Start Managing Patients',
      description: 'Begin scheduling appointments, recording consultations, managing prescriptions, and tracking patient progress.'
    },
    {
      number: 5,
      title: 'Grow Your Practice',
      description: 'Use analytics to optimize operations, improve patient care, and expand your medical cabinet efficiently.'
    }
  ];

  trackByStep(index: number, step: Step): number {
    return step.number;
  }
}