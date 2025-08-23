import { Test, TestingModule } from '@nestjs/testing';
import { EventOrganizerController } from './event-organizer.controller';
import { EventOrganizerService } from './event-organizer.service';

describe('EventOrganizerController', () => {
  let controller: EventOrganizerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventOrganizerController],
      providers: [EventOrganizerService],
    }).compile();

    controller = module.get<EventOrganizerController>(EventOrganizerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
