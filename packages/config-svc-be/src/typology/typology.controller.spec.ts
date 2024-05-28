import { Test, TestingModule } from '@nestjs/testing';
import { TypologyController } from './typology.controller';
import { TypologyService } from './typology.service';
import { createMock } from '@golevelup/ts-jest';

describe('TypologyController', () => {
  let controller: TypologyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypologyController],
      providers: [TypologyService],
    })
      .useMocker(createMock)
      .compile();

    controller = module.get<TypologyController>(TypologyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
