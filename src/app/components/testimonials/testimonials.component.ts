import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Testimonial {
  quote: string;
  author: {
    name: string;
    title: string;
    company: string;
  };
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss']
})
export class TestimonialsComponent {
  testimonials: Testimonial[] = [
    {
      quote: "MedCabinet Pro has transformed our practice management. Patient records are organized, appointments run smoothly, and our billing has never been more efficient. The time saved allows us to focus on patient care.",
      author: {
        name: "Dr. Sarah Johnson",
        title: "General Practitioner",
        company: "Johnson Family Medicine"
      }
    },
    {
      quote: "The platform's intuitive design and comprehensive features have streamlined our entire workflow. From patient intake to treatment follow-ups, everything is seamlessly integrated. Our staff loves it!",
      author: {
        name: "Dr. Michael Chen",
        title: "Pediatrician",
        company: "Sunshine Pediatric Clinic"
      }
    },
    {
      quote: "As a specialist managing multiple locations, MedCabinet Pro's analytics and reporting tools have been invaluable. We can track performance metrics and make data-driven decisions to improve patient outcomes.",
      author: {
        name: "Dr. Lisa Rodriguez",
        title: "Dermatologist",
        company: "Advanced Dermatology Centers"
      }
    }
  ];

  trackByAuthor(index: number, testimonial: Testimonial): string {
    return testimonial.author.name;
  }

  getAuthorInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('');
  }
}