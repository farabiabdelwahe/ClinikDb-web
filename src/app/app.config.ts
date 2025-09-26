import { ApplicationConfig, provideZoneChangeDetection, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { GlobalErrorHandler } from './services/global-error-handler';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAnalytics, getAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideAnimationsAsync(),
    // Firebase providers - only if configuration is complete
    ...(environment.firebase.apiKey && environment.firebase.projectId
      ? [
          provideFirebaseApp(() => {
            console.log('🔥 Initializing Firebase with project:', environment.firebase.projectId);
            return initializeApp(environment.firebase);
          }),
          provideAuth(() => {
            console.log('🔐 Initializing Firebase Auth');
            return getAuth();
          }),
          provideFirestore(() => {
            console.log('📄 Initializing Firestore');
            return getFirestore();
          }),
          // Only provide analytics if measurementId exists
          ...(environment.firebase.measurementId
            ? [provideAnalytics(() => {
                console.log('📊 Initializing Firebase Analytics');
                return getAnalytics();
              })]
            : []),
        ]
      : []),
    provideCharts(withDefaultRegisterables()),
    // Firebase services - only if Firebase is configured
    ...(environment.firebase.apiKey && environment.firebase.projectId
      ? [ScreenTrackingService, UserTrackingService]
      : []),
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};
