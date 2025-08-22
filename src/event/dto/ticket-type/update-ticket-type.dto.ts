import { PartialType } from '@nestjs/swagger';
import { CreateTicketTypeDTO } from './create-ticket-type.dto';

export class UpdateTicketTypeDTO extends PartialType(CreateTicketTypeDTO) {}
