import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: (isProd ? process.env.PORT_PROD : process.env.PORT_DEV) || process.env.PORT || 3000,
  API_KEY: (isProd ? process.env.API_KEY_PROD : process.env.API_KEY_DEV) || process.env.API_KEY || 'default_api_key',
  SESSION_ID: (isProd ? process.env.SESSION_ID_PROD : process.env.SESSION_ID_DEV) || process.env.SESSION_ID || 'zapbridge_session',
  BASE_URL: (isProd ? process.env.BASE_URL_PROD : process.env.BASE_URL_DEV) || process.env.BASE_URL || 'http://localhost:3000',
  SESSION_PATH: path.join(process.cwd(), 'auth_info'),
};
