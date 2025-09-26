import { defaultFirebaseConfig } from "./firebase-defaults";

const env = (import.meta as any)?.env || {};

export const environment = {
  production: true,
  apiUrl: 'https://api.medcabinetpro.com/api',
  appVersion: '1.0.0',
  firebase: {
    apiKey: env.NG_APP_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
    authDomain: env.NG_APP_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
    projectId: env.NG_APP_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
    storageBucket:
      env.NG_APP_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
    messagingSenderId:
      env.NG_APP_FIREBASE_MESSAGING_SENDER_ID ||
      defaultFirebaseConfig.messagingSenderId,
    appId: env.NG_APP_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
    measurementId:
      env.NG_APP_FIREBASE_MEASUREMENT_ID ||
      defaultFirebaseConfig.measurementId
  },
};
