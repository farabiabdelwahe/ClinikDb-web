import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { LucideAngularModule, Quote, Star, StarHalf } from 'lucide-angular';

interface Testimonial {
  quote: string;
  author: {
    name: string;
    title: string;
    company: string;
    avatar?: string;
  };
  rating: number;
  highlight?: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, LucideAngularModule],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss']
})
export class TestimonialsComponent {
  readonly Quote = Quote;
  readonly Star = Star;
  readonly StarHalf = StarHalf;
  
  testimonials: Testimonial[] = [
    {
      quote: "MedCabinet Pro has transformed our practice management. Patient records are organized, appointments run smoothly, and our billing has never been more efficient.",
      highlight: "The time saved allows us to focus on patient care.",
      author: {
        name: "Dr. Sarah Johnson",
        title: "General Practitioner",
        company: "Johnson Family Medicine"
      },
      rating: 5
    },
    {
      quote: "The platform's intuitive design and comprehensive features have streamlined our entire workflow. From patient intake to treatment follow-ups, everything is seamlessly integrated.",
      highlight: "Our staff loves it!",
      author: {
        name: "Dr. Michael Chen",
        title: "Pediatrician",
        company: "Sunshine Pediatric Clinic"
      },
      rating: 5
    },
    {
      quote: "As a specialist managing multiple locations, MedCabinet Pro's analytics and reporting tools have been invaluable.",
      highlight: "We can track performance metrics and make data-driven decisions to improve patient outcomes.",
      author: {
        name: "Dr. Lisa Rodriguez",
        title: "Dermatologist",
        company: "Advanced Dermatology Centers"
      },
      rating: 5
    }
  ];

  trackByAuthor(index: number, testimonial: Testimonial): string {
    return testimonial.author.name;
  }

  getAuthorInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('');
  }
  
  getStarArray(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }
    
    if (hasHalfStar) {
      stars.push('half');
    }
    
    while (stars.length < 5) {
      stars.push('empty');
    }
    
    return stars;
  }
  
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}