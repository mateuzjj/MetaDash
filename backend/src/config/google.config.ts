import { registerAs } from '@nestjs/config';

export default registerAs('google', () => ({
  // OAuth2 Credentials
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/v1/auth/google/callback',
  
  // API Scopes
  scopes: [
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/analytics',
    'https://www.googleapis.com/auth/adwords',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ],

  // Rate Limits
  analyticsQuota: {
    requestsPerDay: 50000,
    requestsPer100Seconds: 100,
  },
  adsQuota: {
    requestsPerDay: 15000,
    requestsPerMinute: 100,
  },
}));
