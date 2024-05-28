import { Test, TestingModule } from '@nestjs/testing';
import { TypologyService } from './typology.service';
import { createMock } from '@golevelup/ts-jest';

describe('TypologyService', () => {
  let service: TypologyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypologyService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get<TypologyService>(TypologyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
