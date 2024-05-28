import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { faker } from '@faker-js/faker';
import { user } from './mocks/userMocks';
import { rule, ruleConfig } from './mocks/mocks';
import { assignPrivileges } from './utils';
import { ArangoDatabaseService } from '../src/arango-database/arango-database.service';

describe('AppController (e2e)', () => {
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
    await arangoService.truncateCollections();
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
        ...rule,
      });
    return response.body;
  };

  const createRuleConfig = async () => {
    const ruleId = (await createRule())._key;
    return await request(app.getHttpServer())
      .post('/rule-config')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        ...ruleConfig,
        ruleId,
      });
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
      const ruleId = (await createRule())._key;
      const response = await request(app.getHttpServer())
        .post('/rule-config')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ...ruleConfig,
          ruleId: `rule/${ruleId}`,
        });

      expect(response.status).toBe(201);
    });

    it('/ (POST) should fail to create a new rule config with invalid rule Id', async () => {
      const incorrectRuleId = faker.string.uuid();
      const response = await request(app.getHttpServer())
        .post('/rule-config')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ...ruleConfig,
          ruleId: `rule/${incorrectRuleId}`,
        });
      expect(response.status).toBe(404);
    });

    it('/:id (GET) should get a single rule config', async () => {
      const ruleConfig = await createRuleConfig();
      const id = ruleConfig.body._key;

      const result = await request(app.getHttpServer())
        .get(`/rule-config/${id}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(result.status).toBe(200);
    });

    it('/:id (GET) should fail on non existing rule config', async () => {
      const id = faker.string.uuid();
      const result = await request(app.getHttpServer())
        .get(`/rule-config/${id}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(result.status).toBe(404);
    });

    it('/:id (PATCH) should update an existing rule config', async () => {
      const ruleConfig = await createRuleConfig();
      const id = ruleConfig.body._key;

      const result = await request(app.getHttpServer())
        .patch(`/rule-config/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          cfg: '2.0.0',
          ruleId: `rule/${id}`,
          updatedBy: user.username,
          desc: faker.string.sample(),
        });

      console.log('result.body', result.body);
      expect(result.status).toBe(200);
      expect(result.body.originatedID).toBe(id);
    });

    it('/:id/disable (POST) should disable an existing rule', async () => {
      const ruleConfig = await createRuleConfig();
      const id = ruleConfig.body._key;

      const response = await request(app.getHttpServer())
        .post(`/rule-config/${id}/disable`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(201);
    });

    it('/:id (DELETE) should make a rule for deletion', async () => {
      const ruleConfig = await createRuleConfig();
      const id = ruleConfig.body._key;

      const response = await request(app.getHttpServer())
        .delete(`/rule-config/${id}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(200);
    });
  });
});
