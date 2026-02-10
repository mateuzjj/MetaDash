import { registerAs } from '@nestjs/config';

export default registerAs('meta', () => ({
  // App Credentials
  appId: process.env.META_APP_ID,
  appSecret: process.env.META_APP_SECRET,
  
  // API Version
  apiVersion: process.env.META_API_VERSION || 'v18.0',
  
  // Rate Limits
  rateLimit: {
    callsPerHour: 200,
    callsPerMinute: 10,
  },

  // Batch Size for Insights
  batchSize: 50,
}));
