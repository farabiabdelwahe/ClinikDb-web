import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../components/hero/hero.component';
import { FeaturesComponent } from '../components/features/features.component';
import { HowItWorksComponent } from '../components/how-it-works/how-it-works.component';
import { PricingComponent } from '../components/pricing/pricing.component';
import { TestimonialsComponent } from '../components/testimonials/testimonials.component';
import { CtaComponent } from '../components/cta/cta.component';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    FeaturesComponent,
    HowItWorksComponent,
    PricingComponent,
    TestimonialsComponent,
    CtaComponent,
    FooterComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent { }
