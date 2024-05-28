import { v4 as uuidv4 } from 'uuid';
export const AUTH_N_SVC_BASEURL = process.env['AUTH_N_SVC_BASEURL'];
export const AUTH_N_TOKEN_ISSUER_NAME = process.env['AUTH_N_TOKEN_ISSUER_NAME'];
export const AUTH_N_TOKEN_AUDIENCE = process.env['AUTH_N_TOKEN_AUDIENCE'];
export const AUTH_N_SVC_JWKS_URL =
  process.env['AUTH_N_SVC_JWKS_URL'] ||
  `${AUTH_N_SVC_BASEURL}/.well-known/jwks.json`;

export const AUTH_N_SVC_TOKEN_URL = AUTH_N_SVC_BASEURL + '/token';
export const KAFKA_URL = process.env['KAFKA_URL'];
export const BC_NAME = process.env['BC_NAME'];
export const APP_NAME = process.env['APP_NAME'];
export const APP_VERSION = process.env['APP_VERSION'];
export const INSTANCE_ID = `${BC_NAME}_${APP_NAME}__${uuidv4()}`;
export const SVC_CLIENT_ID = process.env['SVC_CLIENT_ID'];
export const SVC_CLIENT_SECRET = process.env['SVC_CLIENT_SECRET'];
export const AUTHORIZATION_BASEURL = process.env['AUTHORIZATION_BASEURL'];
