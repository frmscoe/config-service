import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { faker } from '@faker-js/faker';
import { user } from './mocks/userMocks';
import { assignPrivileges } from './utils';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });

  describe('/auth e2e tests', () => {
    it('/auth/login (POST) should login a user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(user);
      expect(response.status).toBe(201);
      expect(response.body.access_token).toBeDefined();
      expect(response.body.token_type).toEqual('Bearer');
      userToken = response.body.access_token;
    });

    it('should reject invalid jwt', async () => {
      const token = faker.string.uuid();
      const response = await request(app.getHttpServer())
        .get('/rule')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(401);
    });

    it('should return a user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(200);
    });

    it('should assign a user necessary privileges', async () => {
      const response = await assignPrivileges(userToken, user.username);
      expect(response.status).toBe(200);
    });
  });
});
