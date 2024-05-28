import { Test, TestingModule } from '@nestjs/testing';
import { TypologyConfigService } from './typology-config.service';
import { createMock } from '@golevelup/ts-jest';

describe('TypologyConfigService', () => {
  let service: TypologyConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypologyConfigService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get<TypologyConfigService>(TypologyConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
