const env = (import.meta as any)?.env || {};

export const environment = {
  production: true,
  apiUrl: 'https://api.medcabinetpro.com/api',
  appVersion: '1.0.0',
  firebase: {
    apiKey: env.NG_APP_FIREBASE_API_KEY || '',
    authDomain: env.NG_APP_FIREBASE_AUTH_DOMAIN || '',
    projectId: env.NG_APP_FIREBASE_PROJECT_ID || '',
    storageBucket: env.NG_APP_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: env.NG_APP_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: env.NG_APP_FIREBASE_APP_ID || '',
    measurementId: env.NG_APP_FIREBASE_MEASUREMENT_ID || ''
  },
};
