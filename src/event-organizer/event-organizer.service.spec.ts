import { Test, TestingModule } from '@nestjs/testing';
import { EventOrganizerService } from './event-organizer.service';

describe('EventOrganizerService', () => {
  let service: EventOrganizerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventOrganizerService],
    }).compile();

    service = module.get<EventOrganizerService>(EventOrganizerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
