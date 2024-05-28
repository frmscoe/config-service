import { Test, TestingModule } from '@nestjs/testing';
import { PrivilegeService } from './privilege.service';
import { createMock } from '@golevelup/ts-jest';

describe('PrivilegeService', () => {
  let service: PrivilegeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrivilegeService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get<PrivilegeService>(PrivilegeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
