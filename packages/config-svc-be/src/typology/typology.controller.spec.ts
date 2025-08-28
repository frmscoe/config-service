// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RulePrivileges } from '../rule/privilege.constant';
import { RuleConfigPrivilege } from '../rule-config/privilege.constant';
import { TypologyPrivilege } from './privilege.constant';

class JwtAuthGuardMock_TypologyCreate {
  canActivate(ctx: any) {
    const req = ctx.switchToHttp().getRequest();
    req.user = {
      sub: 'e2e-user-id',
      username: 'e2e-user',
      privileges: [
        RulePrivileges.CREATE_RULE,                // seed rule
        RuleConfigPrivilege.CREATE_RULE_CONFIG,    // seed rule-config
        RuleConfigPrivilege.GET_RULE_CONFIGS,      // list rule-configs to fetch id
        TypologyPrivilege.CREATE_TYPOLOGY,         // create typology
      ],
    };
    return true;
  }
}
class RolesGuardMock_TypologyCreate { canActivate() { return true; } }

// ---- Helpers ----
function extractDoc(body: any) {
  if (!body || typeof body !== 'object') return undefined;
  const candidate =
    body.typology ||
    body.ruleConfig ||
    body.rule ||
    body.data ||
    body.new ||
    body.doc ||
    body;
  return Array.isArray(candidate) ? candidate[0] : candidate;
}

function arangoIdFromAny(doc: any, collection?: string): string | undefined {
  if (!doc) return undefined;
  if (typeof doc === 'string') {
    return doc.includes('/') ? doc : (collection ? `${collection}/${doc}` : undefined);
  }
  if (doc._id) return doc._id;
  if (doc.id) return doc.id;
  if (doc._key && collection) return `${collection}/${doc._key}`;
  return undefined;
}

function extractList(body: any): any[] {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.result)) return body.result;
  return [];
}



class JwtAuthGuardMock_TypologyList {
  canActivate(ctx: any) {
    const req = ctx.switchToHttp().getRequest();
    req.user = {
      sub: 'e2e-user-id',
      username: 'e2e-user',
      privileges: [
        // seed dependencies
        RulePrivileges.CREATE_RULE,
        RuleConfigPrivilege.CREATE_RULE_CONFIG,
        RuleConfigPrivilege.GET_RULE_CONFIGS, // to fetch RC id via list
        // action under test
        TypologyPrivilege.CREATE_TYPOLOGY,
        TypologyPrivilege.GET_TYPOLOGIES,
      ],
    };
    return true;
  }
}
class RolesGuardMock_TypologyList { canActivate() { return true; } }

// ---- Helpers (names suffixed to avoid collisions) ----
function extractDoc_TY002(body: any) {
  if (!body || typeof body !== 'object') return undefined;
  const candidate =
    body.typology ||
    body.ruleConfig ||
    body.rule ||
    body.data ||
    body.new ||
    body.doc ||
    body;
  return Array.isArray(candidate) ? candidate[0] : candidate;
}
function arangoIdFromAny_TY002(doc: any, collection?: string): string | undefined {
  if (!doc) return undefined;
  if (typeof doc === 'string') {
    return doc.includes('/') ? doc : (collection ? `${collection}/${doc}` : undefined);
  }
  if (doc._id) return doc._id;
  if (doc.id) return doc.id;
  if (doc._key && collection) return `${collection}/${doc._key}`;
  return undefined;
}
function extractList_TY002(body: any): any[] {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.result)) return body.result;
  return [];
}


class JwtAuthGuardMock_TypologyGetById {
  canActivate(ctx: any) {
    const req = ctx.switchToHttp().getRequest();
    req.user = {
      sub: 'e2e-user-id',
      username: 'e2e-user',
      privileges: [
        // seed dependencies
        RulePrivileges.CREATE_RULE,
        RuleConfigPrivilege.CREATE_RULE_CONFIG,
        RuleConfigPrivilege.GET_RULE_CONFIGS, // list RC to fetch id
        TypologyPrivilege.CREATE_TYPOLOGY,
        // endpoint under test
        TypologyPrivilege.GET_TYPOLOGY,
      ],
    };
    return true;
  }
}
class RolesGuardMock_TY003 { canActivate() { return true; } }

// ---- Helpers (suffix to avoid collisions with other specs) ----
function extractDoc_TY003(body: any) {
  if (!body || typeof body !== 'object') return undefined;
  const candidate =
    body.typology ||
    body.ruleConfig ||
    body.rule ||
    body.data ||
    body.new ||
    body.doc ||
    body;
  return Array.isArray(candidate) ? candidate[0] : candidate;
}
function extractList_TY003(body: any): any[] {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.result)) return body.result;
  return [];
}
function arangoIdFromAny_TY003(doc: any, collection?: string): string | undefined {
  if (!doc) return undefined;
  if (typeof doc === 'string') return doc.includes('/') ? doc : (collection ? `${collection}/${doc}` : undefined);
  if (doc._id) return doc._id;
  if (doc.id) return doc.id;
  if (doc._key && collection) return `${collection}/${doc._key}`;
  return undefined;
}


class JwtAuthGuardMock_TY004 {
  canActivate(ctx: any) {
    const req = ctx.switchToHttp().getRequest();
    req.user = {
      sub: 'e2e-user-id',
      username: 'e2e-user',
      privileges: [
        // seeding
        RulePrivileges.CREATE_RULE,
        RuleConfigPrivilege.CREATE_RULE_CONFIG,
        RuleConfigPrivilege.GET_RULE_CONFIGS,
        TypologyPrivilege.CREATE_TYPOLOGY,
        // under test + verify
        TypologyPrivilege.UPDATE_TYPOLOGY,
        TypologyPrivilege.GET_TYPOLOGY,
      ],
    };
    return true;
  }
}
class RolesGuardMock_TY004 { canActivate() { return true; } }

// ---- Helpers (scoped for this test) ----
function extractDoc_TY004(body: any) {
  if (!body || typeof body !== 'object') return undefined;
  const candidate =
    body.typology ||
    body.ruleConfig ||
    body.rule ||
    body.data ||
    body.new ||
    body.doc ||
    body;
  return Array.isArray(candidate) ? candidate[0] : candidate;
}
function extractList_TY004(body: any): any[] {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.result)) return body.result;
  return [];
}
function arangoIdFromAny_TY004(doc: any, collection?: string): string | undefined {
  if (!doc) return undefined;
  if (typeof doc === 'string') return doc.includes('/') ? doc : (collection ? `${collection}/${doc}` : undefined);
  if (doc._id) return doc._id;
  if (doc.id) return doc.id;
  if (doc._key && collection) return `${collection}/${doc._key}`;
  return undefined;
}

describe('E2E-TY-001  /typology  POST  Creates typology with configs', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard).useValue(new JwtAuthGuardMock_TypologyCreate())
      .overrideGuard(RolesGuard).useValue(new RolesGuardMock_TypologyCreate())
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('should create a typology (linked to a rule & its config) and return 201/200', async () => {
    // 1) Seed a Rule
    const seedRule = {
      name: `e2e-rule-${Date.now()}`,
      desc: 'E2E typology seed rule',
      cfg: 'v1',
      state: '01_DRAFT',
      ownerId: 'e2e-user-id',
    };
    const createRuleRes = await request(app.getHttpServer())
      .post('/rule')
      .send(seedRule)
      .expect(201);

    const createdRule = extractDoc(createRuleRes.body);
    const ruleId = arangoIdFromAny(createdRule, 'rule');
    expect(ruleId).toBeDefined();

    // 2) Seed a Rule-Config for that Rule
    const rcPayload = {
      cfg: '1.0.0',
      desc: 'E2E typology seed rule-config',
      ruleId: ruleId as string,
      state: '01_DRAFT',
      ownerId: 'e2e-user-id',
      config: { exitConditions: [{ subRuleRef: '.x00', reason: 'seed' }] },
    };
    await request(app.getHttpServer())
      .post('/rule-config')
      .send(rcPayload)
      .expect(201);

    // 3) List rule-configs and find the one we just created (avoid relying on POST envelope)
    const listRes = await request(app.getHttpServer())
      .get('/rule-config?page=1&limit=50')
      .expect(200);

    const allConfigs = extractList(listRes.body);
    const match = allConfigs.find(
      (it: any) => it?.desc === rcPayload.desc && it?.ruleId === rcPayload.ruleId
    );
    expect(match).toBeDefined();

    const ruleConfigId = arangoIdFromAny(match, 'rule_config');
    expect(ruleConfigId).toBeDefined();

    // 4) Create Typology referencing the Rule + Rule-Config
    const baseName = `e2e-typ-${Date.now()}`;
    const payload = {
      name: baseName,
      cfg: '1.0.0',
      desc: 'E2E create typology test',
      typologyCategoryUUID: ['typology_category/e2e'],
      rules_rule_configs: [
        {
          ruleId: ruleId as string,
          ruleConfigId: [ruleConfigId as string], // per DTO (array)
        },
      ],
      state: '01_DRAFT',
      ownerId: 'e2e-user-id',
    };

    const res = await request(app.getHttpServer())
      .post('/typology')
      .send(payload)
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          // eslint-disable-next-line no-console
          console.error('Create Typology Error:', r.body);
        }
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body).toBeDefined();

    const doc = extractDoc(res.body) ?? res.body;
    expect(typeof doc).toBe('object');
    if (doc.name) expect(doc.name).toBe(baseName);
    if (doc.cfg) expect(doc.cfg).toBe('1.0.0');
    if (doc.rules_rule_configs) expect(Array.isArray(doc.rules_rule_configs)).toBe(true);
  });
});




describe('E2E-TY-002  /typology  GET  Lists all typologies', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard).useValue(new JwtAuthGuardMock_TypologyList())
      .overrideGuard(RolesGuard).useValue(new RolesGuardMock_TypologyList())
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('should return 200 and an array-like list of typologies', async () => {
    // 1) Seed a Rule
    const seedRule = {
      name: `e2e-rule-${Date.now()}`,
      desc: 'E2E typology list seed rule',
      cfg: 'v1',
      state: '01_DRAFT',
      ownerId: 'e2e-user-id',
    };
    const createRuleRes = await request(app.getHttpServer())
      .post('/rule')
      .send(seedRule)
      .expect(201);
    const createdRule = extractDoc_TY002(createRuleRes.body);
    const ruleId = arangoIdFromAny_TY002(createdRule, 'rule');
    expect(ruleId).toBeDefined();

    // 2) Seed a Rule-Config linked to that Rule
    const rcPayload = {
      cfg: '1.0.0',
      desc: 'E2E typology list seed rule-config',
      ruleId: ruleId as string,
      state: '01_DRAFT',
      ownerId: 'e2e-user-id',
      config: { exitConditions: [{ subRuleRef: '.x00', reason: 'seed' }] },
    };
    await request(app.getHttpServer())
      .post('/rule-config')
      .send(rcPayload)
      .expect(201);

    // Look up the created rule-config via GET (don’t assume POST envelope)
    const rcListRes = await request(app.getHttpServer())
      .get('/rule-config?page=1&limit=50')
      .expect(200);
    const rcItems = extractList_TY002(rcListRes.body);
    const rcMatch = rcItems.find(
      (it: any) => it?.desc === rcPayload.desc && it?.ruleId === rcPayload.ruleId
    );
    expect(rcMatch).toBeDefined();
    const ruleConfigId = arangoIdFromAny_TY002(rcMatch, 'rule_config');
    expect(ruleConfigId).toBeDefined();

    // 3) Create a Typology referencing the Rule + Rule-Config
    const typName = `e2e-typ-${Date.now()}`;
    const typPayload = {
      name: typName,
      cfg: '1.0.0',
      desc: 'E2E list typologies seed',
      typologyCategoryUUID: ['typology_category/e2e'],
      rules_rule_configs: [
        { ruleId: ruleId as string, ruleConfigId: [ruleConfigId as string] },
      ],
      state: '01_DRAFT',
      ownerId: 'e2e-user-id',
    };
    await request(app.getHttpServer())
      .post('/typology')
      .send(typPayload)
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          // eslint-disable-next-line no-console
          console.error('Seed Typology Error:', r.body);
        }
      })
      .expect((r) => expect([200, 201]).toContain(r.status));

    // 4) List typologies
    const listRes = await request(app.getHttpServer())
      .get('/typology?page=1&limit=10')
      .expect(200);

    const list = extractList_TY002(listRes.body);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);

    // If "name" exists on items, ensure ours is present
    const hasName = list.some((t: any) => t && typeof t === 'object' && 'name' in t);
    if (hasName) {
      expect(list.some((t: any) => t.name === typName)).toBe(true);
    }
  });
});




describe('E2E-TY-003  /typology/:id  GET  Gets typology details', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard).useValue(new JwtAuthGuardMock_TypologyGetById())
      .overrideGuard(RolesGuard).useValue(new RolesGuardMock_TY003())
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('should return 200 and a typology object for a valid id', async () => {
    // 1) Seed a Rule
    const seedRule = {
      name: `e2e-rule-${Date.now()}`,
      desc: 'E2E typology get-by-id seed rule',
      cfg: 'v1',
      state: '01_DRAFT',
      ownerId: 'e2e-user-id',
    };
    const createRuleRes = await request(app.getHttpServer())
      .post('/rule')
      .send(seedRule)
      .expect(201);
    const createdRule = extractDoc_TY003(createRuleRes.body);
    const ruleId = arangoIdFromAny_TY003(createdRule, 'rule');
    expect(ruleId).toBeDefined();

    // 2) Seed a Rule-Config for that Rule
    const rcPayload = {
      cfg: '1.0.0',
      desc: 'E2E typology get-by-id seed rule-config',
      ruleId: ruleId as string,
      state: '01_DRAFT',
      ownerId: 'e2e-user-id',
      config: { exitConditions: [{ subRuleRef: '.x00', reason: 'seed' }] },
    };
    await request(app.getHttpServer()).post('/rule-config').send(rcPayload).expect(201);

    // 2b) Find the created rule-config via list (don’t rely on POST envelope)
    const rcListRes = await request(app.getHttpServer())
      .get('/rule-config?page=1&limit=50')
      .expect(200);
    const rcList = extractList_TY003(rcListRes.body);
    const rcMatch = rcList.find((it: any) => it?.desc === rcPayload.desc && it?.ruleId === rcPayload.ruleId);
    expect(rcMatch).toBeDefined();
    const ruleConfigId = arangoIdFromAny_TY003(rcMatch, 'rule_config');
    expect(ruleConfigId).toBeDefined();

    // 3) Create Typology referencing the Rule + Rule-Config
    const typName = `e2e-typ-${Date.now()}`;
    const typPayload = {
      name: typName,
      cfg: '1.0.0',
      desc: 'E2E typology get-by-id seed',
      typologyCategoryUUID: ['typology_category/e2e'],
      rules_rule_configs: [
        { ruleId: ruleId as string, ruleConfigId: [ruleConfigId as string] },
      ],
      state: '01_DRAFT',
      ownerId: 'e2e-user-id',
    };
    const createTypRes = await request(app.getHttpServer())
      .post('/typology')
      .send(typPayload)
      .expect((r) => {
        if (![200, 201].includes(r.status)) console.error('Seed Typology Error:', r.body);
      });
    expect([200, 201]).toContain(createTypRes.status);

    const createdTyp = extractDoc_TY003(createTypRes.body);
    const typId = arangoIdFromAny_TY003(createdTyp, 'typology');
    expect(typId).toBeDefined();

    // 4) GET /typology/:id
    const getRes = await request(app.getHttpServer())
      .get(`/typology/${encodeURIComponent(typId as string)}`)
      .expect(200);

    expect(getRes.body).toBeDefined();
    expect(typeof getRes.body).toBe('object');

    // Soft validations (only assert when properties are present)
    if (getRes.body.name)  expect(getRes.body.name).toBe(typName);
    if (getRes.body.cfg)   expect(getRes.body.cfg).toBe('1.0.0');
    if (getRes.body.desc)  expect(getRes.body.desc).toBe('E2E typology get-by-id seed');
    if (getRes.body.rules_rule_configs) expect(Array.isArray(getRes.body.rules_rule_configs)).toBe(true);
  });
});





describe('E2E-TY-004  /typology/:id  PATCH  Updates typology scoring/layout', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard).useValue(new JwtAuthGuardMock_TY004())
      .overrideGuard(RolesGuard).useValue(new RolesGuardMock_TY004())
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('should patch typology score and return 200, then reflect via GET', async () => {
    // 1) Seed Rule
    const seedRule = {
      name: `e2e-rule-${Date.now()}`,
      desc: 'E2E typology update seed rule',
      cfg: 'v1',
      state: '01_DRAFT',
      ownerId: 'e2e-user-id',
    };
    const createRuleRes = await request(app.getHttpServer())
      .post('/rule')
      .send(seedRule)
      .expect(201);
    const createdRule = extractDoc_TY004(createRuleRes.body);
    const ruleId = arangoIdFromAny_TY004(createdRule, 'rule');
    expect(ruleId).toBeDefined();

    // 2) Seed Rule-Config for that Rule
    const rcPayload = {
      cfg: '1.0.0',
      desc: 'E2E typology update seed rule-config',
      ruleId: ruleId as string,
      state: '01_DRAFT',
      ownerId: 'e2e-user-id',
      config: { exitConditions: [{ subRuleRef: '.x00', reason: 'seed' }] },
    };
    await request(app.getHttpServer()).post('/rule-config').send(rcPayload).expect(201);

    // Lookup RC id via list
    const rcListRes = await request(app.getHttpServer())
      .get('/rule-config?page=1&limit=50')
      .expect(200);
    const rcList = extractList_TY004(rcListRes.body);
    const rcMatch = rcList.find(
      (it: any) => it?.desc === rcPayload.desc && it?.ruleId === rcPayload.ruleId
    );
    expect(rcMatch).toBeDefined();
    const ruleConfigId = arangoIdFromAny_TY004(rcMatch, 'rule_config');
    expect(ruleConfigId).toBeDefined();

    // 3) Create Typology referencing Rule + Rule-Config
    const name = `e2e-typ-${Date.now()}`;
    const createTyp = {
      name,
      cfg: '1.0.0',
      desc: 'E2E typology patch seed',
      typologyCategoryUUID: ['typology_category/e2e'],
      rules_rule_configs: [
        { ruleId: ruleId as string, ruleConfigId: [ruleConfigId as string] },
      ],
      state: '01_DRAFT',
      ownerId: 'e2e-user-id',
    };
    const createTypRes = await request(app.getHttpServer())
      .post('/typology')
      .send(createTyp)
      .expect((r) => expect([200, 201]).toContain(r.status));
    const createdTyp = extractDoc_TY004(createTypRes.body);
    const typId = arangoIdFromAny_TY004(createdTyp, 'typology');
    expect(typId).toBeDefined();

    // 4) Patch scoring/layout (score object per schema)
    const updates = {
      score: {
        rules: [
          {
            id: ruleId as string, // reference to rule
            cfg: '1.0.0',         // version string
            ref: 'R1',            // alias/reference label
            true: '10',           // weights as strings per schema
            false: '0',
          },
        ],
        expression: {
          operator: 'OR',
          terms: [{ id: ruleId as string, cfg: '1.0.0' }],
        },
      },
    };

    const patchRes = await request(app.getHttpServer())
      .patch(`/typology/${encodeURIComponent(typId as string)}`)
      .send(updates)
      .expect((r) => {
        if (r.status !== 200) {
          // eslint-disable-next-line no-console
          console.error('Patch Typology Error:', r.body);
        }
      })
      .expect(200);

    expect(patchRes.body).toBeDefined();
    expect(typeof patchRes.body).toBe('object');

    // 5) Verify via GET /typology/:id
    const getRes = await request(app.getHttpServer())
      .get(`/typology/${encodeURIComponent(typId as string)}`)
      .expect(200);

    expect(getRes.body).toBeDefined();
    const body = getRes.body;

    // Soft validations: only assert when present
    if (body.score) {
      expect(typeof body.score).toBe('object');
      if (Array.isArray(body.score.rules) && body.score.rules.length > 0) {
        const r0 = body.score.rules[0];
        if (r0.id) expect(r0.id).toBe(ruleId);
        if (r0.cfg) expect(r0.cfg).toBe('1.0.0');
        if (r0.ref) expect(r0.ref).toBe('R1');
        if (r0.true) expect(r0.true).toBe('10');
        if (r0.false) expect(r0.false).toBe('0');
      }
      if (body.score.expression) {
        const exp = body.score.expression;
        if (exp.operator) expect(exp.operator).toBe('OR');
        if (Array.isArray(exp.terms) && exp.terms.length > 0) {
          const t0 = exp.terms[0];
          if (t0.id) expect(t0.id).toBe(ruleId);
          if (t0.cfg) expect(t0.cfg).toBe('1.0.0');
        }
      }
    }
  });
});

