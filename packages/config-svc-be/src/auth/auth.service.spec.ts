// auth.service.spec.ts
import { AuthService } from './auth.service';
import { UserEmailMappingService } from '../user-mapping/user-email-mapping.service';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';


jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('@tazama-lf/frms-coe-lib/lib/config', () => ({
  validateProcessorConfig: jest.fn().mockReturnValue({
    MAX_CPU: 2, // or whatever config is minimally required
  }),
}));

jest.mock('@tazama-lf/frms-coe-lib', () => ({
  LoggerService: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));


describe('AuthService - validateUser()', () => {
  let authService: AuthService;
  let mockUserEmailMappingService: Partial<UserEmailMappingService>;

  beforeEach(() => {
    mockUserEmailMappingService = {
      upsertMapping: jest.fn(),
    };

    authService = new AuthService(mockUserEmailMappingService as UserEmailMappingService);
  });

  it('AUTH-001: Should return user object when credentials are valid', async () => {
    const mockToken = 'mock.jwt.token';
    const mockLogin = jest
      .spyOn(authService, 'login')
      .mockResolvedValue({ access_token: mockToken } as any);

    const result = await authService.validateUser('test@example.com', 'pass123');

    // expect(mockLogin).toHaveBeenCalledWith({
    //   username: 'test@example.com',
    //   password: 'pass123',
    // });
    expect(mockLogin).toHaveBeenCalledWith({
      username: 'test@example.com',
      password: 'pass123',
      client_id: 'internal',
      grant_type: 'password',
      client_secret: 'internal_secret',
    });

    expect(result).toEqual({ username: 'test@example.com' });
  });

  it('AUTH-001: Should return null when credentials are invalid', async () => {
    jest.spyOn(authService, 'login').mockRejectedValue(new Error('Invalid credentials'));

    const result = await authService.validateUser('wrong@example.com', 'wrongpass');

    expect(result).toBeNull();
  });
});



describe('AuthService - login()', () => {
  let authService: AuthService;
  let userEmailMappingService: UserEmailMappingService;

  beforeEach(() => {
    userEmailMappingService = {
      upsertMapping: jest.fn(),
    } as any;

    authService = new AuthService(userEmailMappingService);
  });

  it('AUTH-002: Should return LoginResponseDto with token and user info', async () => {
    const tokenPayload = {
      clientId: 'client123',
      claims: ['read', 'write'],
      iat: 1700000000,
      exp: 1700003600, // 1 hour later
    };

    const fakeToken = jwt.sign(tokenPayload, 'secret'); // use real jwt to encode token
    mockedAxios.post.mockResolvedValueOnce({ data: fakeToken });

    const credentials = {
      username: 'user@example.com',
      password: 'mypassword',
      client_id: 'internal',
      client_secret: 'internal_secret',
      grant_type: 'password',
    };

    const result = await authService.login(credentials);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:3020/v1/auth/login',
      {
        username: credentials.username,
        password: credentials.password,
      },
      expect.any(Object)
    );

    expect(userEmailMappingService.upsertMapping).toHaveBeenCalledWith(
      'client123',
      credentials.username,
      ['read', 'write']
    );

    expect(result).toEqual({
      token_type: 'Bearer',
      scope: 'read write',
      access_token: expect.any(String),
      expires_in: 3600,
      refresh_token: null,
      refresh_expires_in: null,
      id_token: null,
    });
  });
});

