// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { NetworkMapPrivilege } from './privilege.constant';
import { RulePrivileges } from '../rule/privilege.constant';
import { RuleConfigPrivilege } from '../rule-config/privilege.constant';

class JwtAuthGuardMock_NM_Create {
  canActivate(ctx: any) {
    const req = ctx.switchToHttp().getRequest();
    req.user = {
      sub: 'e2e-user-id',
      username: 'e2e-user',
      privileges: [
        // seed dependencies
        RulePrivileges.CREATE_RULE,
        RuleConfigPrivilege.CREATE_RULE_CONFIG,
        RuleConfigPrivilege.GET_RULE_CONFIGS,
        // endpoint under test
        NetworkMapPrivilege.CREATE_NETWORK_MAP,
      ],
    };
    return true;
  }
}
class RolesGuardMock_NM_Create { canActivate() { return true; } }

// helpers
function extractDoc(body: any) {
  if (!body || typeof body !== 'object') return undefined;
  const c = body.networkMap || body.data || body.new || body.doc || body;
  return Array.isArray(c) ? c[0] : c;
}
function extractList(body: any): any[] {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.result)) return body.result;
  return [];
}
function arangoIdFrom(doc: any, collection?: string): string | undefined {
  if (!doc) return undefined;
  if (typeof doc === 'string') return doc.includes('/') ? doc : (collection ? `${collection}/${doc}` : undefined);
  if (doc._id) return doc._id;
  if (doc.id) return doc.id;
  if (doc._key && collection) return `${collection}/${doc._key}`;
  return undefined;
}


// If helpers from E2E-NM-001 already exist, you can reuse them and
// delete these local helpers to avoid duplication.
function extractDoc_nm2(body: any) {
  if (!body || typeof body !== 'object') return undefined;
  const c = body.networkMap || body.data || body.new || body.doc || body;
  return Array.isArray(c) ? c[0] : c;
}
function arangoIdFrom_nm2(doc: any, collection?: string): string | undefined {
  if (!doc) return undefined;
  if (typeof doc === 'string') return doc.includes('/') ? doc : (collection ? `${collection}/${doc}` : undefined);
  if (doc._id) return doc._id;
  if (doc.id) return doc.id;
  if (doc._key && collection) return `${collection}/${doc._key}`;
  return undefined;
}
function extractList_nm2(body: any): any[] {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.result)) return body.result;
  return [];
}

class JwtAuthGuardMock_NM_GetById {
  canActivate(ctx: any) {
    const req = ctx.switchToHttp().getRequest();
    req.user = {
      sub: 'e2e-user-id',
      username: 'e2e-user',
      privileges: [
        // seed dependencies
        RulePrivileges.CREATE_RULE,
        RuleConfigPrivilege.CREATE_RULE_CONFIG,
        RuleConfigPrivilege.GET_RULE_CONFIGS,
        // endpoint under test
        NetworkMapPrivilege.CREATE_NETWORK_MAP,
        NetworkMapPrivilege.GET_NETWORK_MAP,
      ],
    };
    return true;
  }
}
class RolesGuardMock_NM_GetById { canActivate() { return true; } }

describe('E2E-NM-001  /network-map  POST  Creates a new network map', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard).useValue(new JwtAuthGuardMock_NM_Create())
      .overrideGuard(RolesGuard).useValue(new RolesGuardMock_NM_Create())
      .compile();

    app = modRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('should create a network map and return 201/200', async () => {
    // 1) Seed a Rule (to reference inside network map typology rulesWithConfigs)
    const ruleSeed = {
      name: `e2e-rule-${Date.now()}`,
      desc: 'E2E NM seed rule',
      cfg: '1.0.0',
      state: '01_DRAFT',
      ownerId: 'e2e-user-id',
    };
    const ruleRes = await request(app.getHttpServer())
      .post('/rule')
      .send(ruleSeed)
      .expect(201);
    const ruleDoc = extractDoc(ruleRes.body);
    const ruleId = arangoIdFrom(ruleDoc, 'rule');
    const ruleKey = ruleDoc?._key;
    const ruleName = ruleDoc?.name;
    const ruleCfg = ruleDoc?.cfg || '1.0.0';
    expect(ruleId).toBeDefined();

    // 2) Seed a Rule-Config for that Rule
    const rcSeed = {
      cfg: '1.0.0',
      desc: 'E2E NM seed rule-config',
      ruleId: ruleId as string,
      state: '01_DRAFT',
      ownerId: 'e2e-user-id',
      // minimal config to satisfy schema/business rules
      config: { exitConditions: [{ subRuleRef: '.x00', reason: 'seed' }] },
    };
    await request(app.getHttpServer()).post('/rule-config').send(rcSeed).expect(201);

    // 2b) Get the created rule-config (don’t rely on POST envelope shape)
    const rcListRes = await request(app.getHttpServer())
      .get('/rule-config?page=1&limit=50')
      .expect(200);
    const rcList = extractList(rcListRes.body);
    const rc = rcList.find((x: any) => x?.desc === rcSeed.desc && x?.ruleId === rcSeed.ruleId);
    expect(rc).toBeDefined();
    const rcId = arangoIdFrom(rc, 'rule_config');
    const rcKey = rc?._key;
    const rcCfg = rc?.cfg || '1.0.0';
    expect(rcId).toBeDefined();

    // 3) Create Network Map with the exact DTO shape
    const nmPayload = {
      name: `e2e-network-map-${Date.now()}`,
      description: 'E2E create network map test',
      active: false,
      cfg: '1.0.0',
      state: '01_DRAFT', // optional but allowed
      events: [
        {
          eventId: 'event/e2e-evt-001',
          typologies: [
            {
              id: 'Typology Processor 1@1.0.0',
              name: 'Typology Processor 1',
              cfg: '1.0.0',
              active: true,
              rulesWithConfigs: [
                {
                  rule: {
                    _id: ruleId as string,
                    _key: ruleKey as string,
                    name: ruleName as string,
                    cfg: ruleCfg,
                  },
                  ruleConfigs: [
                    {
                      _id: rcId as string,
                      _key: rcKey as string,
                      cfg: rcCfg,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      source: 'user_created',
    };

    const res = await request(app.getHttpServer())
      .post('/network-map')
      .send(nmPayload)
      .expect(r => {
        if (![200, 201].includes(r.status)) {
          // eslint-disable-next-line no-console
          console.error('Create Network Map Error:', r.body);
        }
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body).toBeDefined();
    expect(typeof res.body).toBe('object');

    // Soft verification on returned doc
    const doc = extractDoc(res.body) ?? res.body;
    if (doc.name) expect(doc.name).toContain('e2e-network-map-');
    if (doc.cfg) expect(doc.cfg).toBe('1.0.0');
    if (doc.state) expect(typeof doc.state).toBe('string');
    if (doc._key) expect(typeof doc._key).toBe('string');
  });
});




describe('E2E-NM-002  /network-map/:id  GET  Retrieves network map by ID', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard).useValue(new JwtAuthGuardMock_NM_GetById())
      .overrideGuard(RolesGuard).useValue(new RolesGuardMock_NM_GetById())
      .compile();

    app = modRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('should return 200 and a network map object for a valid id', async () => {
    // 1) Seed a Rule
    const ruleSeed = {
      name: `e2e-rule-${Date.now()}`,
      desc: 'E2E NM get-by-id seed rule',
      cfg: '1.0.0',
      state: '01_DRAFT',
      ownerId: 'e2e-user-id',
    };
    const ruleRes = await request(app.getHttpServer())
      .post('/rule')
      .send(ruleSeed)
      .expect(201);
    const ruleDoc = extractDoc_nm2(ruleRes.body);
    const ruleId = arangoIdFrom_nm2(ruleDoc, 'rule');
    const ruleKey = ruleDoc?._key;
    const ruleName = ruleDoc?.name;
    const ruleCfg = ruleDoc?.cfg || '1.0.0';
    expect(ruleId).toBeDefined();

    // 2) Seed a Rule-Config
    const rcSeed = {
      cfg: '1.0.0',
      desc: 'E2E NM get-by-id seed rule-config',
      ruleId: ruleId as string,
      state: '01_DRAFT',
      ownerId: 'e2e-user-id',
      config: { exitConditions: [{ subRuleRef: '.x00', reason: 'seed' }] },
    };
    await request(app.getHttpServer()).post('/rule-config').send(rcSeed).expect(201);

    // Fetch the created rule-config to get its _id/_key
    const rcListRes = await request(app.getHttpServer())
      .get('/rule-config?page=1&limit=50')
      .expect(200);
    const rcList = extractList_nm2(rcListRes.body);
    const rc = rcList.find((x: any) => x?.desc === rcSeed.desc && x?.ruleId === rcSeed.ruleId);
    expect(rc).toBeDefined();
    const rcId = arangoIdFrom_nm2(rc, 'rule_config');
    const rcKey = rc?._key;
    const rcCfg = rc?.cfg || '1.0.0';
    expect(rcId).toBeDefined();

    // 3) Create a Network Map
    const nmPayload = {
      name: `e2e-network-map-${Date.now()}`,
      description: 'E2E NM get-by-id test',
      active: false,
      cfg: '1.0.0',
      state: '01_DRAFT',
      events: [
        {
          eventId: 'event/e2e-evt-001',
          typologies: [
            {
              id: 'Typology Processor 1@1.0.0',
              name: 'Typology Processor 1',
              cfg: '1.0.0',
              active: true,
              rulesWithConfigs: [
                {
                  rule: {
                    _id: ruleId as string,
                    _key: ruleKey as string,
                    name: ruleName as string,
                    cfg: ruleCfg,
                  },
                  ruleConfigs: [
                    { _id: rcId as string, _key: rcKey as string, cfg: rcCfg },
                  ],
                },
              ],
            },
          ],
        },
      ],
      source: 'user_created',
    };

    const createRes = await request(app.getHttpServer())
      .post('/network-map')
      .send(nmPayload)
      .expect(r => {
        if (![200, 201].includes(r.status)) {
          // eslint-disable-next-line no-console
          console.error('Create NM (for GET-by-id) Error:', r.body);
        }
      });
    expect([200, 201]).toContain(createRes.status);
    const created = extractDoc_nm2(createRes.body) ?? createRes.body;
    const nmId = arangoIdFrom_nm2(created, 'network_map');
    expect(nmId).toBeDefined();

    // 4) GET /network-map/:id
    const getRes = await request(app.getHttpServer())
      .get(`/network-map/${encodeURIComponent(nmId as string)}`)
      .expect(200);

    expect(getRes.body).toBeDefined();
    expect(typeof getRes.body).toBe('object');

    // Soft validations when fields exist
    if (getRes.body.name)        expect(getRes.body.name).toContain('e2e-network-map-');
    if (getRes.body.cfg)         expect(getRes.body.cfg).toBe('1.0.0');
    if (getRes.body.state)       expect(typeof getRes.body.state).toBe('string');
    if (getRes.body.description) expect(typeof getRes.body.description).toBe('string');
  });
});
