import { PartialType } from '@nestjs/swagger';
import { CreateEventPeriodDTO } from './create-event-period.dto';

export class UpdateEventPeriodDTO extends PartialType(CreateEventPeriodDTO) {}
