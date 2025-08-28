// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Test, TestingModule } from '@nestjs/testing';
import { UserEmailMappingService } from './user-email-mapping.service';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { UserEmailMapping } from './user-email-mapping.interface';


describe('UserEmailMappingService', () => {
  let service: UserEmailMappingService;
  let arangoDbServiceMock: any;
  let queryMock: jest.Mock;

  beforeEach(async () => {
    queryMock = jest.fn();

    arangoDbServiceMock = {
      getDatabase: jest.fn().mockReturnValue({
        collection: jest.fn(), // used in constructor
        query: queryMock,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserEmailMappingService,
        {
          provide: ArangoDatabaseService,
          useValue: arangoDbServiceMock,
        },
      ],
    }).compile();

    service = module.get<UserEmailMappingService>(UserEmailMappingService);
  });

  describe('upsertMapping', () => {
    // UM-001
    it('UM-001: Should create user email mapping successfully', async () => {
      // Arrange
      const clientId = 'client-001';
      const email = 'test@example.com';
      const privileges = ['READ_CONFIG', 'WRITE_CONFIG'];

      queryMock.mockResolvedValueOnce({
        // simulate cursor behavior if needed later
        next: jest.fn().mockResolvedValue(null),
      });

      // Act
      await service.upsertMapping(clientId, email, privileges);

      // Assert
      expect(arangoDbServiceMock.getDatabase).toHaveBeenCalled();
      expect(queryMock).toHaveBeenCalledWith(expect.stringContaining('UPSERT'), expect.objectContaining({
        clientId,
        email,
        privileges,
        now: expect.any(String),
      }));
    });
  });

  describe('findByClientId', () => {
    // UM-002
    it('UM-002: Should retrieve user by clientId', async () => {
      // Arrange
      const mockClientId = 'client-123';
      const mockUser: UserEmailMapping = {
        clientId: mockClientId,
        email: 'user@example.com',
        privileges: ['READ_CONFIG', 'WRITE_CONFIG'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryMock.mockResolvedValueOnce({
        next: jest.fn().mockResolvedValue(mockUser),
      });

      // Act
      const result = await service.findByClientId(mockClientId);

      // Assert
      expect(arangoDbServiceMock.getDatabase).toHaveBeenCalled();
      expect(queryMock).toHaveBeenCalledWith(expect.stringContaining('FILTER doc.clientId == @clientId'), {
        clientId: mockClientId,
      });
      expect(result).toEqual(mockUser);
    });
  });

  it('UM-003: Should update existing email mapping', async () => {
    const clientId = 'client-123';
    const updatedEmail = 'updated@example.com';
    const updatedPrivileges = ['UPDATED_PRIVILEGE'];

    queryMock.mockResolvedValueOnce({
      next: jest.fn().mockResolvedValue({
        clientId,
        email: updatedEmail,
        privileges: updatedPrivileges,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });

    await service.upsertMapping(clientId, updatedEmail, updatedPrivileges);

    expect(arangoDbServiceMock.getDatabase).toHaveBeenCalled();
    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining('UPSERT'), expect.objectContaining({
      clientId,
      email: updatedEmail,
      privileges: updatedPrivileges,
      now: expect.any(String),
    }));
  });

  // UM-004
  describe('validateEmailFormat', () => {
    it('UM-004: Should return true for a valid email address', () => {
      const validEmail = 'test@example.com';
      const result = service.validateEmailFormat(validEmail);
      expect(result).toBe(true);
    });

    // it('UM-004: Should return false for an invalid email address', () => {
    //   const invalidEmails = [
    //     'invalid-email',
    //     'user@.com',
    //     '@domain.com',
    //     'user@domain',
    //     'user@domain..com',
    //     'user@domain,com',
    //     ' user@example.com ', // has spaces
    //     ''
    //   ];

    //   for (const email of invalidEmails) {
    //     expect(service.validateEmailFormat(email)).toBe(false);
    //   }
    // });
    it('UM-004: Should return false for an invalid email address', () => {
      const invalidEmails = [
        'invalid-email',
        'user@.com',
        '@domain.com',
        'user@domain',
        'user@domain..com',
        'user@domain,com',
        ' user@example.com ', // has spaces
        ''
      ];

      for (const email of invalidEmails) {
        const result = service.validateEmailFormat(email);
        console.log(`Testing: "${email}" → Result: ${result}`);
        expect(result).toBe(false);
      }
    });

  });



});
