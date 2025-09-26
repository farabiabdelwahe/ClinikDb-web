// International (non-Tunisia) environment configuration
import { defaultFirebaseConfig } from "./firebase-defaults";

const env = (import.meta as any)?.env || {};

export const environment = {
  production: true,
  region: "intl",
  apiUrl:
    env.apiUrlINTL || env.NG_APP_API_URL_INTL || "https://api.example.com/api",

  // Feature flags
  features: {
    agentCommission: false,
    geoIpDetection: true,
    useDashboardMockData: true,
    bypassAdminGuard: false,
  },

  // Firebase configuration (all optional here; expected to be provided at build time
  // through define/inject or environment variables). Leaving empty strings avoids runtime
  // exceptions when a service is not enabled for intl version.
  firebase: {
    apiKey:
      env.NG_APP_FIREBASE_API_KEY_INTL ||
      env.NG_APP_FIREBASE_API_KEY ||
      defaultFirebaseConfig.apiKey,
    authDomain:
      env.NG_APP_FIREBASE_AUTH_DOMAIN_INTL ||
      env.NG_APP_FIREBASE_AUTH_DOMAIN ||
      defaultFirebaseConfig.authDomain,
    projectId:
      env.NG_APP_FIREBASE_PROJECT_ID_INTL ||
      env.NG_APP_FIREBASE_PROJECT_ID ||
      defaultFirebaseConfig.projectId,
    storageBucket:
      env.NG_APP_FIREBASE_STORAGE_BUCKET_INTL ||
      env.NG_APP_FIREBASE_STORAGE_BUCKET ||
      defaultFirebaseConfig.storageBucket,
    messagingSenderId:
      env.NG_APP_FIREBASE_MESSAGING_SENDER_ID_INTL ||
      env.NG_APP_FIREBASE_MESSAGING_SENDER_ID ||
      defaultFirebaseConfig.messagingSenderId,
    appId:
      env.NG_APP_FIREBASE_APP_ID_INTL ||
      env.NG_APP_FIREBASE_APP_ID ||
      defaultFirebaseConfig.appId,
    measurementId:
      env.NG_APP_FIREBASE_MEASUREMENT_ID_INTL ||
      env.NG_APP_FIREBASE_MEASUREMENT_ID ||
      defaultFirebaseConfig.measurementId,
  },

  // Versioning – optionally overridden at build time
  appVersion: env.NG_APP_VERSION || "1.0.0-intl",

  // Helper to know at runtime that this build is the international variant.
  buildMeta: {
    generatedAt: new Date().toISOString(),
    enableAgentCommissionCodePath: false,
  },
};

export type AppEnvironment = typeof environment;
