import { PartialType } from '@nestjs/swagger';
import { EventDTO } from './create-event.dto';

export class UpdateEventDto extends PartialType(EventDTO) {}
