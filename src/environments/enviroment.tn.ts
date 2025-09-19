const env = (import.meta as any)?.env || {};

export const environment = {
  production: true,
  region: "tn",
  apiUrl:
    env.apiUrlTN || env.NG_APP_API_URL_TN || "https://api.tn.example.com/api",

  // Feature flags (Tunisia build enables commission system)
  features: {
    agentCommission: true,
    geoIpDetection: true,
  },

  // Firebase configuration (override via build-time define or runtime injection)
  firebase: {
    apiKey: env.NG_APP_FIREBASE_API_KEY_TN || env.NG_APP_FIREBASE_API_KEY || "",
    authDomain:
      env.NG_APP_FIREBASE_AUTH_DOMAIN_TN ||
      env.NG_APP_FIREBASE_AUTH_DOMAIN ||
      "",
    projectId:
      env.NG_APP_FIREBASE_PROJECT_ID_TN || env.NG_APP_FIREBASE_PROJECT_ID || "",
    storageBucket:
      env.NG_APP_FIREBASE_STORAGE_BUCKET_TN ||
      env.NG_APP_FIREBASE_STORAGE_BUCKET ||
      "",
    messagingSenderId:
      env.NG_APP_FIREBASE_MESSAGING_SENDER_ID_TN ||
      env.NG_APP_FIREBASE_MESSAGING_SENDER_ID ||
      "",
    appId: env.NG_APP_FIREBASE_APP_ID_TN || env.NG_APP_FIREBASE_APP_ID || "",
    measurementId:
      env.NG_APP_FIREBASE_MEASUREMENT_ID_TN ||
      env.NG_APP_FIREBASE_MEASUREMENT_ID ||
      "",
  },

  appVersion: env.NG_APP_VERSION || "1.0.0-tn",

  buildMeta: {
    generatedAt: new Date().toISOString(),
    enableAgentCommissionCodePath: true,
  },
};
