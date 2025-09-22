import { Test, TestingModule } from '@nestjs/testing';
import { NseService } from './nse.service';

describe('NseService', () => {
  let service: NseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NseService],
    }).compile();

    service = module.get<NseService>(NseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
