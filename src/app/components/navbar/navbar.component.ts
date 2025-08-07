import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Activity, Menu, X, ChevronRight } from 'lucide-angular';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatBadgeModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ transform: 'translateX(0%)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)' }))
      ])
    ])
  ]
})
export class NavbarComponent implements OnInit, OnDestroy {
  isScrolled = false;
  isMobileMenuOpen = false;
  activeSection = 'home';
  
  readonly Activity = Activity;
  readonly Menu = Menu;
  readonly X = X;
  readonly ChevronRight = ChevronRight;
  
  navItems = [
    { label: 'Features', section: 'features', icon: 'dashboard' },
    { label: 'How it Works', section: 'how-it-works', icon: 'build' },
    { label: 'Pricing', section: 'pricing', icon: 'attach_money' },
    { label: 'Testimonials', section: 'testimonials', icon: 'star' }
  ];

  private scrollListener = () => {
    this.isScrolled = window.scrollY > 20;
  };

  ngOnInit(): void {
    window.addEventListener('scroll', this.scrollListener);
    this.checkActiveSection();
  }
  
  @HostListener('window:scroll')
  onScroll(): void {
    this.checkActiveSection();
  }
  
  checkActiveSection(): void {
    const sections = ['features', 'how-it-works', 'pricing', 'testimonials'];
    const scrollPosition = window.scrollY + 100;
    
    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const { offsetTop, offsetHeight } = element;
        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          this.activeSection = section;
          return;
        }
      }
    }
    
    if (window.scrollY < 100) {
      this.activeSection = 'home';
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollListener);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  scrollToSection(sectionId: string): void {
    this.closeMobileMenu();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToTop(): void {
    this.closeMobileMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}