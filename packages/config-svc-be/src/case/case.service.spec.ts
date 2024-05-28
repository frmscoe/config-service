import { Test, TestingModule } from '@nestjs/testing';
import { CaseService } from './case.service';
import { createMock } from '@golevelup/ts-jest';

describe('CaseService', () => {
  let service: CaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CaseService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get<CaseService>(CaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
