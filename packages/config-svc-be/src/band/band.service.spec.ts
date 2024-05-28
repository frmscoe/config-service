import { Test, TestingModule } from '@nestjs/testing';
import { BandService } from './band.service';
import { createMock } from '@golevelup/ts-jest';

describe('BandService', () => {
  let service: BandService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BandService],
    })
      .useMocker(createMock)
      .compile();

    service = module.get<BandService>(BandService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
