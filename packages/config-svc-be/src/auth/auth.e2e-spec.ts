// auth.e2e-spec.ts
import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module'; // Adjust path based on your project structure

describe('E2E-AUTH-002 - /auth/login (POST) - Invalid credentials', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule], // Ensure AuthModule is part of AppModule
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 401 Unauthorized for invalid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'invalid_user@example.com',
        password: 'wrong_password',
      });

    expect(response.status).toBe(401); // or 400 if BadRequestException is thrown
    expect(response.body.message).toBeDefined();
    expect(response.body.message).toMatch(/Authentication failed/i);
  });
});
