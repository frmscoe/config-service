import 'dotenv-defaults/config';

const isTestEnv = process.env.NODE_ENV === 'test';

const databaseName = isTestEnv
  ? process.env.DATABASE_NAME_TEST
  : process.env.DATABASE_NAME;

export const databaseConfig = {
  url: process.env.DATABASE_HOST,
  databaseName: databaseName,
  auth: {
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
  },
};

export const systemDatabaseConfig = {
  url: process.env.DATABASE_HOST,
  databaseName: process.env.SYSTEM_DATABASE_NAME,
  auth: {
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
  },
};
