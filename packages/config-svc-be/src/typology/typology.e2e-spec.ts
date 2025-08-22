// <!-- SPDX-License-Identifier: Apache-2.0 -->
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '~/app.module'; // Adjust if needed

describe('E2E-ACL-004: GET /typology without required privilege', () => {
  let app: INestApplication;

  // This token must be valid but without GET_TYPOLOGIES privilege
  const viewerToken = 'Bearer eyJ...viewer_token_here...';

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

  it('should return 403 Forbidden when user lacks GET_TYPOLOGIES privilege', async () => {
    const res = await request(app.getHttpServer())
      .get('/typology?page=1&limit=10')
      .set('Authorization', viewerToken);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/forbidden/i);
  });
});
