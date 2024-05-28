import { Test, TestingModule } from '@nestjs/testing';
import { TypologyConfigController } from './typology-config.controller';
import { TypologyConfigService } from './typology-config.service';
import { createMock } from '@golevelup/ts-jest';

describe('TypologyConfigController', () => {
  let controller: TypologyConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypologyConfigController],
      providers: [TypologyConfigService],
    })
      .useMocker(createMock)
      .compile();

    controller = module.get<TypologyConfigController>(TypologyConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
