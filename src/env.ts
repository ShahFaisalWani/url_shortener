import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT,
  APP_DOMAIN: process.env.APP_DOMAIN,
  APP_BASE_URL: `${process.env.APP_DOMAIN}:${process.env.PORT}`,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT,
};
