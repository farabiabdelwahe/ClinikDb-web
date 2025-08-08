import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription: Subscription;
  private lastKey: string = '';
  private lastValue: string = '';
  
  constructor(
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {
    this.subscription = this.translationService.currentLang$.subscribe(() => {
      this.lastKey = '';
      this.cdr.markForCheck();
    });
  }
  
  transform(key: string, params?: any): string {
    if (!key) return '';
    
    // Cache to avoid unnecessary translations
    if (key === this.lastKey && !params) {
      return this.lastValue;
    }
    
    this.lastKey = key;
    this.lastValue = this.translationService.translate(key, params);
    return this.lastValue;
  }
  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}