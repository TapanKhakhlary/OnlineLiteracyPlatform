const { config } = require('dotenv');
const Joi = require('joi');

// Load .env file
config();

// Define validation schema
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number()
    .default(5000),
  MONGO_URI: Joi.string()
    .required()
    .description('MongoDB connection URL'),
  JWT_SECRET: Joi.string()
    .required()
    .description('JWT secret key'),
  COOKIE_SECRET: Joi.string()
    .required()
    .description('Cookie secret key'),
  CORS_ORIGINS: Joi.string()
    .default('http://localhost:3000')
}).unknown();

// Validate environment variables
const { error } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = envVarsSchema;