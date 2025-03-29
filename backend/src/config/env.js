import Joi from 'joi';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.join(__dirname, `../../.env.${process.env.NODE_ENV || 'development'}`)
});

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().when('NODE_ENV', {
    is: 'development',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  DB_PASSWORD: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  JWT_SECRET: Joi.string().required().min(32),
  ETH_RPC_URL: Joi.string().required(),
  ALLOCATION_CONTRACT_ADDR: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/),
  EMERGENCY_CONTRACT_ADDR: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/),
  MAPBOX_API_TOKEN: Joi.string().required(),
  DRONE_API_KEY: Joi.string().required(),
  SENTRY_DSN: Joi.string().uri(),
  REDIS_URL: Joi.string().uri()
}).unknown(true);

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  db: {
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    name: envVars.DB_NAME,
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD
  },
  jwt: {
    secret: envVars.JWT_SECRET
  },
  blockchain: {
    rpcUrl: envVars.ETH_RPC_URL,
    contracts: {
      allocation: envVars.ALLOCATION_CONTRACT_ADDR,
      emergency: envVars.EMERGENCY_CONTRACT_ADDR
    }
  },
  thirdParty: {
    mapbox: envVars.MAPBOX_API_TOKEN,
    drone: envVars.DRONE_API_KEY,
    sentry: envVars.SENTRY_DSN
  },
  redis: envVars.REDIS_URL
};
