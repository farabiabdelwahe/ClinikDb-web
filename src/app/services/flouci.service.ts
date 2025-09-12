import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

// Placeholder for Flouci payment integration.
// Wire this to actual HTTP calls when backend/gateway is ready.
@Injectable({ providedIn: 'root' })
export class FlouciService {
  createPaymentIntent(amount: number, currency = 'USD', metadata?: Record<string, unknown>): Observable<{ checkoutUrl: string; intentId: string; }>{
    // TODO: Replace with real API call to create payment session with Flouci
    return of({ checkoutUrl: 'https://pay.flouci.dev/mock/checkout', intentId: 'flc_' + crypto.randomUUID() });
  }

  verifyPayment(transactionRecord: string): Observable<'success' | 'failed' | 'pending'> {
    // TODO: Replace with real verification logic once integrated
    return of('success');
  }
}

