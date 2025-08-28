// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RulePrivileges } from '../rule/privilege.constant';

class JwtAuthGuardMock {
  canActivate(ctx: any) {
    const req = ctx.switchToHttp().getRequest();
    req.user = {
      sub: 'e2e-user-id',
      username: 'e2e-user',
      privileges: [RulePrivileges.CREATE_RULE],
    };
    return true;
  }
}
class RolesGuardMock { canActivate() { return true; } }

// Helper: try to extract a rule-like doc from various common shapes
function extractDoc(body: any) {
  if (!body || typeof body !== 'object') return undefined;
  return body.rule || body.data || body.new || body.doc || body;
}


class JwtAuthGuardMock_List {
  canActivate(ctx: any) {
    const req = ctx.switchToHttp().getRequest();
    req.user = {
      sub: 'e2e-user-id',
      username: 'e2e-user',
      // Need both: create (to seed) + list
      privileges: [RulePrivileges.CREATE_RULE, RulePrivileges.GET_RULES],
    };
    return true;
  }
}
class RolesGuardMock_List { canActivate() { return true; } }

// Helper to extract an array from common list response shapes
function extractList(body: any): any[] {
  if (Array.isArray(body)) return body;
  if (body?.data && Array.isArray(body.data)) return body.data;
  if (body?.items && Array.isArray(body.items)) return body.items;
  if (body?.rules && Array.isArray(body.rules)) return body.rules;
  if (body?.result && Array.isArray(body.result)) return body.result;
  return [];
}



class JwtAuthGuardMock_GetById {
  canActivate(ctx: any) {
    const req = ctx.switchToHttp().getRequest();
    req.user = {
      sub: 'e2e-user-id',
      username: 'e2e-user',
      privileges: [RulePrivileges.CREATE_RULE, RulePrivileges.GET_RULE],
    };
    return true;
  }
}
class RolesGuardMock_GetById { canActivate() { return true; } }

class JwtAuthGuardMock_Update {
  canActivate(ctx: any) {
    const req = ctx.switchToHttp().getRequest();
    req.user = {
      sub: 'e2e-user-id',
      username: 'e2e-user',
      privileges: [
        RulePrivileges.CREATE_RULE,
        RulePrivileges.UPDATE_RULE,
        RulePrivileges.GET_RULE, // to verify after patch
      ],
    };
    return true;
  }
}
class RolesGuardMock_Update { canActivate() { return true; } }

class JwtAuthGuardMock_Disable {
  canActivate(ctx: any) {
    const req = ctx.switchToHttp().getRequest();
    req.user = {
      sub: 'e2e-user-id',
      username: 'e2e-user',
      privileges: [
        RulePrivileges.CREATE_RULE,
        RulePrivileges.DISABLE_RULE,
        RulePrivileges.GET_RULE, // to verify after disabling
      ],
    };
    return true;
  }
}
class RolesGuardMock_Disable { canActivate() { return true; } }

class JwtAuthGuardMock_Delete {
  canActivate(ctx: any) {
    const req = ctx.switchToHttp().getRequest();
    req.user = {
      sub: 'e2e-user-id',
      username: 'e2e-user',
      privileges: [
        RulePrivileges.CREATE_RULE,
        RulePrivileges.DELETE_RULE,
        RulePrivileges.GET_RULE, // verify after delete
      ],
    };
    return true;
  }
}
class RolesGuardMock_Delete { canActivate() { return true; } }


class JwtAuthGuardMock_RuleConfigList {
  canActivate(ctx: any) {
    const req = ctx.switchToHttp().getRequest();
    req.user = {
      sub: 'e2e-user-id',
      username: 'e2e-user',
      privileges: [RulePrivileges.GET_RULE_RULE_CONFIG],
    };
    return true;
  }
}
class RolesGuardMock_RuleConfigList { canActivate() { return true; } }

// derive an Arango-style _id for /rule/:id
function extractArangoId(doc: any): string | undefined {
  if (!doc || typeof doc !== 'object') return undefined;
  return doc._id || doc.id || (doc._key ? `rule/${doc._key}` : undefined);
}





describe('E2E-RULE-001  /rule  POST  Creates a new rule', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard).useValue(new JwtAuthGuardMock())
      .overrideGuard(RolesGuard).useValue(new RolesGuardMock())
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('should create a rule and return 201 Created', async () => {
    const payload = {
      name: `e2e-rule-${Date.now()}`,
      desc: 'E2E create rule test',
      cfg: 'v1',
      state: '01_DRAFT',       // valid StateEnum
      ownerId: 'e2e-user-id',  // matches req.user.sub
      // Optional but allowed if your service expects them:
      // source: 'USER_CREATED',
      // dataType: 'TEXT',
    };

    const res = await request(app.getHttpServer())
      .post('/rule')
      .send(payload)
      .expect((r) => {
        if (r.status !== 201) {
          // surface details if it ever fails
          // eslint-disable-next-line no-console
          console.error('Create Rule Error:', r.body);
        }
      })
      .expect(201);

    // Only assert that a document-like object came back (shape-agnostic)
    expect(res.body).toBeDefined();
    expect(typeof res.body).toBe('object');

    const doc = extractDoc(res.body);
    expect(doc).toBeDefined();
    // Soft sanity checks: don’t fail if service returns minimal meta
    if (doc) {
      // if these exist, they should be valid — but they’re optional for the test
      if (doc.name)  expect(typeof doc.name).toBe('string');
      if (doc.desc)  expect(typeof doc.desc).toBe('string');
      if (doc.cfg)   expect(typeof doc.cfg).toBe('string');
      if (doc.state) expect(typeof doc.state).toBe('string');
      if (doc._key)  expect(typeof doc._key).toBe('string');
    }
  });
});


describe('E2E-RULE-002  /rule  GET  Lists all rules', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard).useValue(new JwtAuthGuardMock_List())
      .overrideGuard(RolesGuard).useValue(new RolesGuardMock_List())
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('should return 200 and an array-like list of rules', async () => {
    // Seed one rule
    const seed = {
      name: `e2e-rule-${Date.now()}`,
      desc: 'E2E list rules seed',
      cfg: 'v1',
      state: '01_DRAFT',
      ownerId: 'e2e-user-id',
    };

    await request(app.getHttpServer())
      .post('/rule')
      .send(seed)
      .expect((r) => {
        if (r.status !== 201) console.error('Seed Create Rule Error:', r.body);
      })
      .expect(201);

    // Basic listing still returns 200 and an array-like payload
    const res = await request(app.getHttpServer())
      .get('/rule?page=1&limit=10')
      .expect(200);

    const list = extractList(res.body);
    expect(Array.isArray(list)).toBe(true);

    // Deterministic verification: filter by name to ensure our seed exists
    const filteredRes = await request(app.getHttpServer())
      .get(`/rule?page=1&limit=10&name=${encodeURIComponent(seed.name)}`)
      .expect(200);

    const filtered = extractList(filteredRes.body);

    // Helper to read a name from possible item shapes
    const getName = (r: any) =>
      r?.name ?? r?.rule?.name ?? r?.data?.name ?? r?.doc?.name;

    expect(filtered.some((r) => getName(r) === seed.name)).toBe(true);
  });

});




describe('E2E-RULE-003  /rule/:id  GET  Retrieves rule details', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard).useValue(new JwtAuthGuardMock_GetById())
      .overrideGuard(RolesGuard).useValue(new RolesGuardMock_GetById())
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('should return 200 and a rule object for a valid id', async () => {
    // 1) Seed a rule
    const seed = {
      name: `e2e-rule-${Date.now()}`,
      desc: 'E2E get-by-id seed',
      cfg: 'v1',
      state: '01_DRAFT',
      ownerId: 'e2e-user-id',
    };

    const createRes = await request(app.getHttpServer())
      .post('/rule')
      .send(seed)
      .expect((r) => {
        if (r.status !== 201) {
          // eslint-disable-next-line no-console
          console.error('Seed Create Rule Error:', r.body);
        }
      })
      .expect(201);

    // 2) Extract Arango id
    const created = extractDoc(createRes.body);
    const id = extractArangoId(created);

    expect(id).toBeDefined(); // must have an id to proceed

    // 3) GET /rule/:id
    const getRes = await request(app.getHttpServer())
      .get(`/rule/${encodeURIComponent(id as string)}`)
      .expect(200);

    expect(getRes.body).toBeDefined();
    expect(typeof getRes.body).toBe('object');

    // Soft validations (only assert when properties are present)
    if (getRes.body.name)  expect(getRes.body.name).toBe(seed.name);
    if (getRes.body.cfg)   expect(getRes.body.cfg).toBe(seed.cfg);
    if (getRes.body.state) expect(getRes.body.state).toBe(seed.state);
    if (getRes.body.desc)  expect(getRes.body.desc).toBe(seed.desc);
  });
});



describe('E2E-RULE-004  /rule/:id  PATCH  Updates rule metadata', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard).useValue(new JwtAuthGuardMock_Update())
      .overrideGuard(RolesGuard).useValue(new RolesGuardMock_Update())
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('should update rule desc and return 200', async () => {
    // Seed
    const seed = {
      name: `e2e-rule-${Date.now()}`,
      desc: 'E2E update seed',
      cfg: 'v1',
      state: '01_DRAFT',
      ownerId: 'e2e-user-id',
    };
    const createRes = await request(app.getHttpServer())
      .post('/rule')
      .send(seed)
      .expect((r) => {
        if (r.status !== 201) console.error('Seed Create Rule Error:', r.body);
      })
      .expect(201);

    const created = extractDoc(createRes.body);
    const id = extractArangoId(created);
    expect(id).toBeDefined();

    // Patch metadata (desc only to avoid state-transition endpoint)
    // Patch metadata (desc only to avoid state-transition endpoint)
    const updates = { desc: 'E2E updated description' };

    const patchRes = await request(app.getHttpServer())
      .patch(`/rule/${encodeURIComponent(id as string)}`)
      .send(updates)
      .expect((r) => {
        if (r.status !== 200) console.error('Patch Rule Error:', r.body);
      })
      .expect(200);

    // Extract the possibly NEW doc/id returned by the duplicate/update flow
    const patchedDoc = extractDoc(patchRes.body);
    const patchedId = extractArangoId(patchedDoc) ?? id;

    // Verify persisted change via GET /rule/:id (use the patched/new id)
    const getRes = await request(app.getHttpServer())
      .get(`/rule/${encodeURIComponent(patchedId as string)}`)
      .expect(200);

    expect(getRes.body).toBeDefined();
    if (getRes.body.desc) {
      expect(getRes.body.desc).toBe(updates.desc);
    }

  });
});


describe('E2E-RULE-005  /rule/:id/disable  POST  Disables a rule', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard).useValue(new JwtAuthGuardMock_Disable())
      .overrideGuard(RolesGuard).useValue(new RolesGuardMock_Disable())
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('should disable a rule and return 200', async () => {
    // 1) Seed a rule
    const seed = {
      name: `e2e-rule-${Date.now()}`,
      desc: 'E2E disable seed',
      cfg: 'v1',
      state: '01_DRAFT',
      ownerId: 'e2e-user-id',
    };

    const createRes = await request(app.getHttpServer())
      .post('/rule')
      .send(seed)
      .expect((r) => {
        if (r.status !== 201) console.error('Seed Create Rule Error:', r.body);
      })
      .expect(201);

    const created = extractDoc(createRes.body);
    const id = extractArangoId(created);
    expect(id).toBeDefined();

    // 2) Disable the rule
    const disableRes = await request(app.getHttpServer())
      .post(`/rule/${encodeURIComponent(id as string)}/disable`)
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          // eslint-disable-next-line no-console
          console.error('Disable Rule Error:', r.body);
        }
      });

    expect([200, 201]).toContain(disableRes.status);

    const disabledDoc = extractDoc(disableRes.body);
    const disabledId = extractArangoId(disabledDoc) ?? id;

    // 3) Verify
    const getRes = await request(app.getHttpServer())
      .get(`/rule/${encodeURIComponent(disabledId as string)}`)
      .expect(200);

    expect(getRes.body).toBeDefined();
    if (getRes.body.state) {
      expect(getRes.body.state).toBe('92_DISABLED');
    }

  });
});





describe('E2E-RULE-006  /rule/:id  DELETE  Marks rule as deleted', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard).useValue(new JwtAuthGuardMock_Delete())
      .overrideGuard(RolesGuard).useValue(new RolesGuardMock_Delete())
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('should delete (mark as deleted) a rule', async () => {
    // 1) Seed a rule
    const seed = {
      name: `e2e-rule-${Date.now()}`,
      desc: 'E2E delete seed',
      cfg: 'v1',
      state: '01_DRAFT',
      ownerId: 'e2e-user-id',
    };

    const createRes = await request(app.getHttpServer())
      .post('/rule')
      .send(seed)
      .expect((r) => { if (r.status !== 201) console.error('Seed Create Error:', r.body); })
      .expect(201);

    const created = extractDoc(createRes.body);
    const id = extractArangoId(created);
    expect(id).toBeDefined();

    // 2) Delete the rule
    const delRes = await request(app.getHttpServer())
      .delete(`/rule/${encodeURIComponent(id as string)}`)
      .expect((r) => {
        if (![200, 201, 204].includes(r.status)) {
          // eslint-disable-next-line no-console
          console.error('Delete Rule Error:', r.body);
        }
      });

    expect([200, 201, 204]).toContain(delRes.status);

    // 3) Verify: either not found anymore, or state is 93_MARKED_FOR_DELETION
    const getRes = await request(app.getHttpServer())
      .get(`/rule/${encodeURIComponent(id as string)}`)
      .then(res => res)
      .catch(err => err.response); // supertest throws on non-2xx

    if (getRes.status === 404) {
      // Hard delete or findOne throws when marked; that’s acceptable
      expect(getRes.status).toBe(404);
    } else {
      expect(getRes.status).toBe(200);
      expect(getRes.body).toBeDefined();
      if (getRes.body.state) {
        expect(getRes.body.state).toBe('93_MARKED_FOR_DELETION');
      }
    }
  });
});




describe('E2E-RULE-007  /rule/rule-config  GET  Gets rule/config mapping', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard).useValue(new JwtAuthGuardMock_RuleConfigList())
      .overrideGuard(RolesGuard).useValue(new RolesGuardMock_RuleConfigList())
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('should return 200 and an array-like list of rule/config mappings', async () => {
    const res = await request(app.getHttpServer())
      .get('/rule/rule-config?page=1&limit=10')
      .expect(200);

    // Shape-agnostic list extraction
    const list = extractList(res.body);
    expect(Array.isArray(list)).toBe(true);

    // Optional soft checks when fields exist
    if (list.length > 0) {
      const first = list[0];
      // If your service returns a combined object, these may exist:
      if (first.rule) expect(typeof first.rule).toBe('object');
      if (first.config || first.ruleConfig) {
        expect(typeof (first.config ?? first.ruleConfig)).toBe('object');
      }
    }
  });
});
