import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Check, Sparkles, Rocket, Crown, Tag, Gift, CheckCircle, X } from 'lucide-angular';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

interface PricingPlan {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  buttonText: string;
  badge?: string;
  icon?: any;
  gradient?: string;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [
    CommonModule, 
    LucideAngularModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatChipsModule,
    FormsModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent {
  readonly Check = Check;
  readonly Sparkles = Sparkles;
  readonly Rocket = Rocket;
  readonly Crown = Crown;
  readonly Tag = Tag;
  readonly Gift = Gift;
  readonly CheckCircle = CheckCircle;
  readonly X = X;
  promoCode: string = '';
  appliedPromoCode: string = '';
  discountPercentage: number = 0;
  
  constructor(private snackBar: MatSnackBar) {}
  plans: PricingPlan[] = [
    {
      name: 'Free Trial',
      price: 0,
      period: '7 days',
      description: 'Try our platform risk-free for 7 days',
      features: [
        'Up to 5 patient records',
        'Basic appointment scheduling',
        'Email support',
        'Standard reports',
        'Mobile app access',
        'Data export'
      ],
      highlighted: false,
      buttonText: 'Start 7-Day Trial',
      icon: this.Sparkles,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      name: 'Annual Plan',
      price: 299,
      period: 'year',
      description: 'Complete solution for medical cabinets',
      features: [
        'Unlimited patient records',
        'Advanced scheduling system',
        'Priority support',
        'Custom reporting',
        'API integrations',
        'Mobile app',
        'Automated workflows',
        'Analytics dashboard',
        'Data backup & security'
      ],
      highlighted: true,
      buttonText: 'Get Started',
      badge: 'Most Popular',
      icon: this.Rocket,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      name: 'Pro Annual',
      price: 599,
      period: 'year',
      description: 'Advanced features for growing practices',
      features: [
        'Everything in Annual Plan',
        'Multi-location support',
        'Dedicated account manager',
        'Advanced analytics',
        'Custom integrations',
        'White-label options',
        'HIPAA compliance tools',
        'Advanced reporting',
        'Priority feature requests',
        '24/7 phone support'
      ],
      highlighted: false,
      buttonText: 'Upgrade to Pro',
      icon: this.Crown,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    }
  ];

  trackByPlan(index: number, plan: PricingPlan): string {
    return plan.name;
  }
  
  private sanitizeCode(value: string): string {
    return value.toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '');
  }

  onPromoInput(value: string): void {
    this.promoCode = this.sanitizeCode(value);
  }

  applyPromoCode(): void {
    this.promoCode = this.sanitizeCode(this.promoCode || '');
    if (!this.promoCode.trim()) {
      this.snackBar.open('Please enter a promo code', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      return;
    }
    
    // Simulate promo code validation
    // In real app, this would validate against backend
    const validPromoCodes: { [key: string]: number } = {
      'AGENT10': 10,
      'AGENT15': 15,
      'AGENT20': 20,
      'LAUNCH25': 25,
      // Match demo data in Admin dashboard
      'ALICE20': 20,
      'BOB10': 10
    };
    
    const discount = validPromoCodes[this.promoCode.toUpperCase()];
    
    if (discount) {
      this.appliedPromoCode = this.promoCode.toUpperCase();
      this.discountPercentage = discount;
      this.snackBar.open(`Promo code applied! ${discount}% discount`, 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['success-snackbar']
      });
    } else {
      this.snackBar.open('Invalid promo code', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
      });
    }
  }
  
  removePromoCode(): void {
    this.appliedPromoCode = '';
    this.discountPercentage = 0;
    this.promoCode = '';
    this.snackBar.open('Promo code removed', 'Close', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
  
  getDiscountedPrice(price: number): number {
    if (this.discountPercentage && price > 0) {
      return price - (price * this.discountPercentage / 100);
    }
    return price;
  }
  
  subscribe(plan: PricingPlan): void {
    // In real app, this would handle subscription with backend
    const finalPrice = this.getDiscountedPrice(plan.price);
    const message = this.appliedPromoCode 
      ? `Subscribing to ${plan.name} with promo code ${this.appliedPromoCode} (${this.discountPercentage}% off) - Total: $${finalPrice}/${plan.period}`
      : `Subscribing to ${plan.name} - Total: $${finalPrice}/${plan.period}`;
    
    this.snackBar.open(message, 'Confirm', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
