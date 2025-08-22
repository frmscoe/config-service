// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RulePrivileges } from '../rule/privilege.constant';
import { RuleConfigPrivilege } from '../rule-config/privilege.constant';

class JwtAuthGuardMock_RuleConfigCreate {
  canActivate(ctx: any) {
    const req = ctx.switchToHttp().getRequest();
    req.user = {
      sub: 'e2e-user-id',
      username: 'e2e-user',
      privileges: [
        RulePrivileges.CREATE_RULE,              // seed a rule
        RuleConfigPrivilege.CREATE_RULE_CONFIG,  // create rule-config
      ],
    };
    return true;
  }
}
class RolesGuardMock_RuleConfigCreate { canActivate() { return true; } }

function extractDoc(body: any) {
  if (!body || typeof body !== 'object') return undefined;
  return body.rule || body.data || body.new || body.doc || body;
}
function extractArangoId(doc: any): string | undefined {
  if (!doc || typeof doc !== 'object') return undefined;
  return doc._id || doc.id || (doc._key ? `rule/${doc._key}` : undefined);
}

describe('E2E-RC-001  /rule-config  POST  Creates rule config', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard).useValue(new JwtAuthGuardMock_RuleConfigCreate())
      .overrideGuard(RolesGuard).useValue(new RolesGuardMock_RuleConfigCreate())
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('should create a rule config and return 201 Created', async () => {
    // 1) Seed a parent Rule
    const seedRule = {
      name: `e2e-rule-${Date.now()}`,
      desc: 'E2E RC seed rule',
      cfg: 'v1',
      state: '01_DRAFT',
      ownerId: 'e2e-user-id',
    };

    const createRuleRes = await request(app.getHttpServer())
      .post('/rule')
      .send(seedRule)
      .expect(201);

    const createdRule = extractDoc(createRuleRes.body);
    const ruleId = extractArangoId(createdRule);
    expect(ruleId).toBeDefined();

    // 2) Minimal, schema-valid payload (no "name", include config.exitConditions[])
    const payload = {
      cfg: '1.0.0',
      desc: 'E2E create rule-config test',
      ruleId: ruleId as string,
      state: '01_DRAFT',        // allowed by schema
      ownerId: 'e2e-user-id',   // allowed by schema
      config: {
        exitConditions: [
          { subRuleRef: '.x00', reason: 'E2E seed exit condition' },
        ],
        // bands: [{ subRuleRef: 'B1', upperLimit: 1000, lowerLimit: 0, reason: 'example' }],
        // cases: [{ subRuleRef: 'C1', value: 'HIGH', reason: 'example' }],
      },
    };

    const res = await request(app.getHttpServer())
      .post('/rule-config')
      .send(payload)
      .expect((r) => {
        if (r.status !== 201) console.error('Create RuleConfig Error:', r.body);
      })
      .expect(201);

    // 3) Shape-agnostic assertions
    expect(res.body).toBeDefined();
    const doc = extractDoc(res.body) ?? res.body;
    expect(typeof doc).toBe('object');

    // Soft checks when present
    if (doc.cfg)   expect(doc.cfg).toBe('1.0.0');
    if (doc.desc)  expect(typeof doc.desc).toBe('string');
    if (doc.ruleId) expect(doc.ruleId).toBe(ruleId);
    if (doc.state) expect(doc.state).toBe('01_DRAFT');
    if (doc.config?.exitConditions) {
      expect(Array.isArray(doc.config.exitConditions)).toBe(true);
      expect(doc.config.exitConditions.length).toBeGreaterThan(0);
      const ec = doc.config.exitConditions[0];
      expect(typeof ec.subRuleRef).toBe('string');
      expect(typeof ec.reason).toBe('string');
    }
  });
});
