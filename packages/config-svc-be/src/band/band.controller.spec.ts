import { Test, TestingModule } from '@nestjs/testing';
import { BandController } from './band.controller';
import { BandService } from './band.service';
import { createMock } from '@golevelup/ts-jest';

describe('BandController', () => {
  let controller: BandController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BandController],
      providers: [BandService],
    })
      .useMocker(createMock)
      .compile();

    controller = module.get<BandController>(BandController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
