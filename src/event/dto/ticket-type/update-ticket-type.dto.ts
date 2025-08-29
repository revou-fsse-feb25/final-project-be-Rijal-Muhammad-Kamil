import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketTypeDTO } from './create-ticket-type.dto';

export class UpdateTicketTypeDTO extends PartialType(CreateTicketTypeDTO) {}
