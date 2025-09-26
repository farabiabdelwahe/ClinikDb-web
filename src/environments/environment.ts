/**
 * Development environment
 * This file is the default (dev) source that will be replaced by
 * enviroment.tn.ts or enviroment.intl.ts in their respective build configurations.
 *
 * Keep flags here so local dev can exercise all code paths without
 * needing to build the specialized variants every time.
 */
import { defaultFirebaseConfig } from "./firebase-defaults";

const env = (import.meta as any)?.env || {};

export const environment = {
  production: false,
  region: "dev",
  apiUrl:
    env.NG_APP_API_URL_DEV || env.NG_APP_API_URL || "http://localhost:3000/api",
  appVersion: env.NG_APP_VERSION || "1.0.0-dev",

  /**
   * Feature flags
   * agentCommission: enabled so you can test commission UI locally
   * geoIpDetection: keep true; you can stub the service if no network call
   */
  features: {
    agentCommission: true,
    geoIpDetection: true,
  },

  /**
   * Firebase config (dev/testing). Use real values only if needed locally.
   * These can be overridden by defining env vars (e.g. NG_APP_FIREBASE_API_KEY_DEV).
   */
  firebase: {
    apiKey:
      env.NG_APP_FIREBASE_API_KEY_DEV ||
      env.NG_APP_FIREBASE_API_KEY ||
      defaultFirebaseConfig.apiKey,
    authDomain:
      env.NG_APP_FIREBASE_AUTH_DOMAIN_DEV ||
      env.NG_APP_FIREBASE_AUTH_DOMAIN ||
      defaultFirebaseConfig.authDomain,
    projectId:
      env.NG_APP_FIREBASE_PROJECT_ID_DEV ||
      env.NG_APP_FIREBASE_PROJECT_ID ||
      defaultFirebaseConfig.projectId,
    storageBucket:
      env.NG_APP_FIREBASE_STORAGE_BUCKET_DEV ||
      env.NG_APP_FIREBASE_STORAGE_BUCKET ||
      defaultFirebaseConfig.storageBucket,
    messagingSenderId:
      env.NG_APP_FIREBASE_MESSAGING_SENDER_ID_DEV ||
      env.NG_APP_FIREBASE_MESSAGING_SENDER_ID ||
      defaultFirebaseConfig.messagingSenderId,
    appId:
      env.NG_APP_FIREBASE_APP_ID_DEV ||
      env.NG_APP_FIREBASE_APP_ID ||
      defaultFirebaseConfig.appId,
    measurementId:
      env.NG_APP_FIREBASE_MEASUREMENT_ID_DEV ||
      env.NG_APP_FIREBASE_MEASUREMENT_ID ||
      defaultFirebaseConfig.measurementId,
  },

  buildMeta: {
    generatedAt: new Date().toISOString(),
    notes: "Local development build with all features enabled.",
  },
};
