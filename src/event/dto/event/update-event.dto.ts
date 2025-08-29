import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDTO } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDTO) {}
