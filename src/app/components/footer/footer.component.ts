import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Twitter, Linkedin, Github } from 'lucide-angular';

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterLink {
  label: string;
  url: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  
  footerSections: FooterSection[] = [
    {
      title: 'Platform',
      links: [
        { label: 'Features', url: '#features' },
        { label: 'Pricing', url: '#pricing' },
        { label: 'Documentation', url: '#' },
        { label: 'API', url: '#' },
        { label: 'Integrations', url: '#' }
      ]
    },
    {
      title: 'For Practices',
      links: [
        { label: 'General Practice', url: '#' },
        { label: 'Specialists', url: '#' },
        { label: 'Multi-Location', url: '#' },
        { label: 'Partner Program', url: '#' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', url: '#' },
        { label: 'Contact', url: '#' },
        { label: 'Training', url: '#' },
        { label: 'Status', url: '#' }
      ]
    },
    {
      title: 'Legal & Compliance',
      links: [
        { label: 'Privacy Policy', url: '#' },
        { label: 'Terms of Service', url: '#' },
        { label: 'HIPAA Compliance', url: '#' },
        { label: 'Security', url: '#' }
      ]
    }
  ];

  socialLinks = [
    {
      name: 'Twitter',
      url: '#',
      icon: Twitter
    },
    {
      name: 'LinkedIn',
      url: '#',
      icon: Linkedin
    },
    {
      name: 'GitHub',
      url: '#',
      icon: Github
    }
  ];

  trackBySection(index: number, section: FooterSection): string {
    return section.title;
  }

  trackByLink(index: number, link: FooterLink): string {
    return link.label;
  }

  trackBySocial(index: number, social: any): string {
    return social.name;
  }
}