// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('E2E-APP-001  /  GET /  Verifies backend server health (ping)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should respond 200 with a non-empty string body', async () => {
    await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        // Controller returns a string, so res.text should be truthy and non-whitespace
        expect(typeof res.text).toBe('string');
        expect(res.text).toMatch(/\S/);
      });
  });
});
