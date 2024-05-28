import { Test, TestingModule } from '@nestjs/testing';
import { RuleService } from './rule.service';
import { createMock } from '@golevelup/ts-jest';

describe('RuleService', () => {
  let service: RuleService;
  const mockArangoDatabaseService = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RuleService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get<RuleService>(RuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a rule', () => {
    expect(mockArangoDatabaseService).toBeDefined();
  });
});
