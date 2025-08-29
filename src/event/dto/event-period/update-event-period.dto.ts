import { PartialType } from '@nestjs/mapped-types';
import { CreateEventPeriodDTO } from './create-event-period.dto';

export class UpdateEventPeriodDTO extends PartialType(CreateEventPeriodDTO) {}
