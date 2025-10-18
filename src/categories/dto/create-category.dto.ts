import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString({ message: 'category must be a valid string' })
  @MinLength(3)
  @MaxLength(50)
  name: string;
}
