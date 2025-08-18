import { PartialType } from '@nestjs/mapped-types';
import { CreateEventOrganizerDto } from './create-event-organizer.dto';

export class UpdateEventOrganizerDto extends PartialType(CreateEventOrganizerDto) {}
