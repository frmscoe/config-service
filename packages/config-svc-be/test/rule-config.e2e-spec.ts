import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { faker } from '@faker-js/faker';
import { user } from './mocks/userMocks';
import { createRuleDto, createRuleConfigDto } from './mocks/mocks';
import { assignPrivileges } from './utils';
import { ArangoDatabaseService } from '../src/arango-database/arango-database.service';

describe('RuleConfig (e2e)', () => {
  let app: INestApplication;
  let arangoService: ArangoDatabaseService;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    arangoService = app.get(ArangoDatabaseService);
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const loginUser = async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send(user)
      .expect('Content-Type', /json/);
  };

  const createRule = async () => {
    const response = await request(app.getHttpServer())
      .post('/rule')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        ...createRuleDto,
      });
    return response.body;
  };

  const createRuleConfig = async () => {
    const rule = await createRule();

    const response = await request(app.getHttpServer())
      .post('/rule-config')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        ...createRuleConfigDto,
        ruleId: rule._key,
      });
    return response.body;
  };

  describe('/rule-config e2e tests', () => {
    it('/auth/login (POST) should login a user', async () => {
      const response = await loginUser();
      expect(response.status).toBe(201);
      expect(response.body.access_token).toBeDefined();
      expect(response.body.token_type).toEqual('Bearer');
      userToken = response.body.access_token;
      await assignPrivileges(userToken, user.username);
    });

    it('/ (POST) should create a new rule config', async () => {
      const ruleId = (await createRule())._id;
      const response = await request(app.getHttpServer())
        .post('/rule-config')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ...createRuleConfigDto,
          ruleId: ruleId,
        });

      expect(response.status).toBe(201);
    });

    it('/ (POST) should fail to create a new rule config with invalid rule Id', async () => {
      const incorrectRuleId = faker.string.uuid();
      const response = await request(app.getHttpServer())
        .post('/rule-config')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ...createRuleConfigDto,
          ruleId: `rule/${incorrectRuleId}`,
        });
      expect(response.status).toBe(404);
    });

    it('/ (POST) should return 401 for unauthorized access', async () => {
      const ruleId = (await createRule())._id;
      const response = await request(app.getHttpServer())
        .post('/rule-config')
        .send({
          ...createRuleConfigDto,
          ruleId,
        });
      expect(response.status).toBe(401);
    });

    it('/ (POST) should fail with validation error for invalid data', async () => {
      const ruleId = (await createRule())._key;
      const response = await request(app.getHttpServer())
        .post('/rule-config')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ...createRuleConfigDto,
          ruleId: `rule/${ruleId}`,
          cfg: 123, // invalid data type
        });
      expect(response.status).toBe(400);
    });

    it('/:id (GET) should get a single rule config', async () => {
      const ruleConfig = await createRuleConfig();
      const key = ruleConfig._key;

      const result = await request(app.getHttpServer())
        .get(`/rule-config/${key}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(result.status).toBe(200);
    });

    it('/:id (GET) should fail on non existing rule config', async () => {
      const key = 'non-existing-id';
      const result = await request(app.getHttpServer())
        .get(`/rule-config/${key}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(result.status).toBe(404);
    });

    it('/ (GET) should retrieve rule configs with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/rule-config?page=1&limit=2')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });

    it('/:id (PATCH) should update an existing rule config', async () => {
      const ruleConfig = await createRuleConfig();
      const id = ruleConfig._key;

      const result = await request(app.getHttpServer())
        .patch(`/rule-config/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          cfg: '2.0.0',
          ruleId: `rule/${id}`,
          updatedBy: user.username,
          desc: faker.string.sample(),
        });

      expect(result.status).toBe(200);
      expect(result.body.originatedID).toBe(id);
    });

    it('/:id (PATCH) should fail to update an existing rule config with concurrent update', async () => {
      const ruleConfig = await createRuleConfig();
      const key = ruleConfig._key;

      await request(app.getHttpServer())
        .patch(`/rule-config/${key}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          cfg: '2.0.0',
          ruleId: `rule/${key}`,
          updatedBy: user.username,
          desc: faker.string.sample(),
        });

      const result = await request(app.getHttpServer())
        .patch(`/rule-config/${key}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          cfg: '2.0.1',
          ruleId: `rule/${key}`,
          updatedBy: user.username,
          desc: faker.string.sample(),
        });

      expect(result.status).toBe(403);
    });

    it('/:id/disable (PATCH) should disable an existing rule', async () => {
      const ruleConfig = await createRuleConfig();
      const id = ruleConfig._key;

      const response = await request(app.getHttpServer())
        .patch(`/rule-config/${id}/disable`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(200);
    });

    it('/:id (DELETE) should mark a rule for deletion', async () => {
      const ruleConfig = await createRuleConfig();
      const id = ruleConfig._key;

      const response = await request(app.getHttpServer())
        .delete(`/rule-config/${id}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(200);
    });

    it('/:id (DELETE) should fail to delete a rule already marked for deletion', async () => {
      const ruleConfig = await createRuleConfig();
      const id = ruleConfig._key;

      await request(app.getHttpServer())
        .delete(`/rule-config/${id}`)
        .set('Authorization', `Bearer ${userToken}`);

      const response = await request(app.getHttpServer())
        .delete(`/rule-config/${id}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(400);
    });
  });
});
