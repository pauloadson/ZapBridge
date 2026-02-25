import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  PORT: process.env.PORT || 3000,
  API_KEY: process.env.API_KEY || 'default_api_key',
  NODE_ENV: process.env.NODE_ENV || 'development',
  SESSION_ID: process.env.SESSION_ID || 'zapbridge_session',
  SESSION_PATH: path.join(process.cwd(), 'auth_info'),
};
