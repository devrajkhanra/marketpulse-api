import { Test, TestingModule } from '@nestjs/testing';
import { NseController } from './nse.controller';

describe('NseController', () => {
  let controller: NseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NseController],
    }).compile();

    controller = module.get<NseController>(NseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
