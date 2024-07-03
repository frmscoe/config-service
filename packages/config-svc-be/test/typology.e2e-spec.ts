import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { faker } from '@faker-js/faker';
import { user } from './mocks/userMocks';
import { typology } from './mocks/mocks';
import { assignPrivileges } from './utils';
import { ArangoDatabaseService } from '../src/arango-database/arango-database.service';

describe('Typology (e2e)', () => {
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

  const createTypology = async () => {
    return await request(app.getHttpServer())
      .post('/typology')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ ...typology });
  };

  describe('/typology e2e tests', () => {
    it('/auth/login (POST) should login a user', async () => {
      const response = await loginUser();
      expect(response.status).toBe(201);
      expect(response.body.access_token).toBeDefined();
      expect(response.body.token_type).toEqual('Bearer');
      userToken = response.body.access_token;
      await assignPrivileges(userToken, user.username);
    });

    it('/ (POST) should create a new typology', async () => {
      const response = await createTypology();
      expect(response.status).toBe(201);
    });

    it('/:id (GET) should retrieve a single typology by ID', async () => {
      const typology = await createTypology();
      const id = typology.body._key;

      const result = await request(app.getHttpServer())
        .get(`/typology/${id}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(result.status).toBe(200);
    });

    it('/:id (GET) should return 404 for non-existent typology', async () => {
      const id = faker.string.uuid();

      const result = await request(app.getHttpServer())
        .get(`/typology/${id}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(result.status).toBe(404);
    });

    it('/ (GET) should retrieve all typologies with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/typology?page=1&limit=2')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });

    it('/:id (PATCH) should update an existing typology', async () => {
      const typology = await createTypology();
      const id = typology.body._key;

      const result = await request(app.getHttpServer())
        .patch(`/typology/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name' });

      expect(result.status).toBe(200);
      expect(result.body._key).toBeDefined();
    });

    it('/:id (PATCH) should return 404 when updating a non-existent typology', async () => {
      const id = faker.string.uuid();

      const result = await request(app.getHttpServer())
        .patch(`/typology/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...typology, name: 'Updated Name' });

      expect(result.status).toBe(404);
    });
  });
});
