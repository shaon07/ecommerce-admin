import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

class OrderProductDto {
  @IsUUID('all', { message: 'productId must be a valid UUID' })
  productId: string;

  @IsInt({ message: 'quantity must be an integer' })
  @Min(1, { message: 'quantity must be at least 1' })
  quantity: number;
}

export class CreateOrderDto {
  @IsArray({ message: 'products must be an array of OrderProductDto' })
  @ArrayNotEmpty({ message: 'products should not be empty' })
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];
}
