// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { v4 as uuidv4 } from 'uuid';

export const DATABASE_HOST = process.env['DATABASE_HOST'];
export const DATABASE_NAME = process.env['DATABASE_NAME'];
export const SYSTEM_DATABASE_NAME = process.env['SYSTEM_DATABASE_NAME'];
export const DATABASE_USERNAME = process.env['DATABASE_USERNAME'];
export const DATABASE_PASSWORD = process.env['DATABASE_PASSWORD'];
export const DATABASE_NAME_TEST = process.env['DATABASE_NAME_TEST'];
export const AUTH_URL = process.env['AUTH_URL'];
export const AUTH_SERVICE_URL = process.env['AUTH_SERVICE_URL'];

export const INSTANCE_ID = `config-svc_${uuidv4()}`;
