import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432).required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  PORT: Joi.number().default(8080),
  AZURE_STORAGE_CONNECTION_STRING: Joi.string().required(),
  AZURE_STORAGE_CONTAINER_NAME: Joi.string().default('posts-images'),
  AZURE_TENANT_ID: Joi.string().required(),
  AZURE_CLIENT_ID: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6380),
  REDIS_PASSWORD: Joi.string().required(),
});
