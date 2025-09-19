// International (non-Tunisia) environment configuration
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
  },

  // Firebase configuration (all optional here; expected to be provided at build time
  // through define/inject or environment variables). Leaving empty strings avoids runtime
  // exceptions when a service is not enabled for intl version.
  firebase: {
    apiKey:
      env.NG_APP_FIREBASE_API_KEY_INTL || env.NG_APP_FIREBASE_API_KEY || "",
    authDomain:
      env.NG_APP_FIREBASE_AUTH_DOMAIN_INTL ||
      env.NG_APP_FIREBASE_AUTH_DOMAIN ||
      "",
    projectId:
      env.NG_APP_FIREBASE_PROJECT_ID_INTL ||
      env.NG_APP_FIREBASE_PROJECT_ID ||
      "",
    storageBucket:
      env.NG_APP_FIREBASE_STORAGE_BUCKET_INTL ||
      env.NG_APP_FIREBASE_STORAGE_BUCKET ||
      "",
    messagingSenderId:
      env.NG_APP_FIREBASE_MESSAGING_SENDER_ID_INTL ||
      env.NG_APP_FIREBASE_MESSAGING_SENDER_ID ||
      "",
    appId: env.NG_APP_FIREBASE_APP_ID_INTL || env.NG_APP_FIREBASE_APP_ID || "",
    measurementId:
      env.NG_APP_FIREBASE_MEASUREMENT_ID_INTL ||
      env.NG_APP_FIREBASE_MEASUREMENT_ID ||
      "",
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
