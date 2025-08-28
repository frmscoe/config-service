// <!-- SPDX-License-Identifier: Apache-2.0 -->
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '~/app.module'; // Adjust if needed

describe('E2E-ACL-001: Viewer attempts to PATCH /rule-config/:id', () => {
  let app: INestApplication;

  // Token without UPDATE_RULE_CONFIG privilege
  const viewerToken = 'Bearer eyJ...viewer_token_here...';

  // Use an existing or test-seeded rule config ID
  const testRuleConfigId = 'rule_config/test-config-id';

  const payload = {
    desc: 'Attempted edit by viewer',
    config: {
      bands: [],
      cases: [],
      exitConditions: [],
    },
  };

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

  it('should return 403 Forbidden when a viewer tries to update a rule config', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/rule-config/${encodeURIComponent(testRuleConfigId)}`)
      .set('Authorization', viewerToken)
      .send(payload);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/forbidden/i);
  });
});
