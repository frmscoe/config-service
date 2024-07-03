import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { faker } from '@faker-js/faker';
import { user } from './mocks/userMocks';
import { createNetworkMapDto } from './mocks/mocks';
import { assignPrivileges } from './utils';
import { ArangoDatabaseService } from '../src/arango-database/arango-database.service';

describe('NetworkMap (e2e)', () => {
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

  const createNetworkMap = async () => {
    return await request(app.getHttpServer())
      .post('/network-map')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ ...createNetworkMapDto });
  };

  describe('/network-map e2e tests', () => {
    it('/auth/login (POST) should login a user', async () => {
      const response = await loginUser();
      expect(response.status).toBe(201);
      expect(response.body.access_token).toBeDefined();
      expect(response.body.token_type).toEqual('Bearer');
      userToken = response.body.access_token;
      await assignPrivileges(userToken, user.username);
    });
  });

  it('/ (POST) should create a new network map', async () => {
    const response = await createNetworkMap();
    expect(response.status).toBe(201);
  });

  it('/ (POST) should return 401 if token is not valid', async () => {
    const response = await request(app.getHttpServer())
      .post('/network-map')
      .set('Authorization', 'fake-token')
      .send({ ...createNetworkMapDto });
    expect(response.status).toBe(401);
  });

  it('/:id (GET) should retrieve a single network map by ID', async () => {
    const networkMap = await createNetworkMap();
    const response = await request(app.getHttpServer())
      .get(`/network-map/${networkMap.body._key}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(200);
  });

  it('/:id (GET) should return 404 if network map not found', async () => {
    const response = await request(app.getHttpServer())
      .get(`/network-map/${faker.string.uuid()}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(response.status).toBe(404);
  });

  it('/:id (GET) should return 401 if token is not valid', async () => {
    const networkMap = await createNetworkMap();
    const response = await request(app.getHttpServer())
      .get(`/network-map/${networkMap.body._key}`)
      .set('Authorization', 'fake-token');
    expect(response.status).toBe(401);
  });

  it('/:id (PATCH) should update a network map', async () => {
    const networkMap = await createNetworkMap();
    const response = await request(app.getHttpServer())
      .patch(`/network-map/${networkMap.body._key}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ active: false });
    expect(response.status).toBe(200);
  });

  it('/:id (PATCH) should return 404 if network map not found', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/network-map/${faker.string.uuid()}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ active: false });
    expect(response.status).toBe(404);
  });

  it('/:id (PATCH) should return 401 if token is not valid', async () => {
    const networkMap = await createNetworkMap();
    const response = await request(app.getHttpServer())
      .patch(`/network-map/${networkMap.body._key}`)
      .set('Authorization', 'fake-token')
      .send({ active: false });
    expect(response.status).toBe(401);
  });

  it('/:id (PATCH) should return 400 if invalid data is sent', async () => {
    const networkMap = await createNetworkMap();
    const response = await request(app.getHttpServer())
      .patch(`/network-map/${networkMap.body._key}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ active: 'false' }); // invalid data
    expect(response.status).toBe(400);
  });
});
