import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as enTranslations from '../../assets/i18n/en.json';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translations: { [key: string]: any } = {
    en: enTranslations,
    fr: {},
    ar: {}
  };
  private currentLangSubject = new BehaviorSubject<string>('en');
  public currentLang$ = this.currentLangSubject.asObservable();
  public currentLang = signal<string>('en');
  private isReadySubject = new BehaviorSubject<boolean>(false);
  public isReady$ = this.isReadySubject.asObservable();
  
  public languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', flag: '🇬🇧' },
    { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', flag: '🇫🇷' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'ltr', flag: '🇸🇦' } // Changed to ltr
  ];
  
  constructor() {
    // English is already loaded from import
    this.loadOtherTranslations();
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    this.setLanguage(savedLang);
    this.isReadySubject.next(true);
  }
  
  private loadOtherTranslations() {
    // Load French and Arabic translations asynchronously
    this.loadTranslation('fr');
    this.loadTranslation('ar');
  }
  
  private async loadTranslation(langCode: string) {
    try {
      const response = await fetch(`/assets/i18n/${langCode}.json`);
      if (response.ok) {
        this.translations[langCode] = await response.json();
      }
    } catch (error) {
      console.error(`Failed to load ${langCode} translations:`, error);
      this.translations[langCode] = {};
    }
  }
  
  async setLanguage(langCode: string) {
    const language = this.languages.find(l => l.code === langCode);
    if (language) {
      // Ensure translations are loaded for this language
      if (!this.translations[langCode] || Object.keys(this.translations[langCode]).length === 0) {
        await this.loadTranslation(langCode);
      }
      
      this.currentLangSubject.next(langCode);
      this.currentLang.set(langCode);
      localStorage.setItem('preferredLanguage', langCode);
      
      // Set document language but not direction (keeping LTR for all)
      document.documentElement.lang = langCode;
      
      // Remove any RTL classes - we want to keep LTR layout for all languages
      document.documentElement.dir = 'ltr';
      document.body.classList.remove('rtl');
    }
  }
  
  translate(key: string, params?: any): string {
    const langCode = this.currentLang();
    
    // If translations haven't loaded yet, return the key
    if (!this.translations[langCode]) {
      return key;
    }
    
    const translation = this.getNestedProperty(this.translations[langCode], key);
    
    if (!translation) {
      // Fallback to English if translation not found
      const fallback = this.getNestedProperty(this.translations['en'], key);
      return fallback || key;
    }
    
    // Replace parameters if provided
    if (params) {
      return this.interpolate(translation, params);
    }
    
    return translation;
  }
  
  private getNestedProperty(obj: any, key: string): any {
    return key.split('.').reduce((o, k) => o?.[k], obj);
  }
  
  private interpolate(str: string, params: any): string {
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => params[key] || match);
  }
  
  getCurrentLanguage(): Language | undefined {
    return this.languages.find(l => l.code === this.currentLang());
  }
}