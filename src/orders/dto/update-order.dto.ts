import { IsEnum, IsNotEmpty } from 'class-validator';
import { STATUS } from '../enums/status.enum';

export class UpdateOrderDto {
  @IsNotEmpty()
  @IsEnum(STATUS, {
    message: `status must be one of: ${Object.values(STATUS).join(', ')}`,
  })
  status: STATUS;
}
