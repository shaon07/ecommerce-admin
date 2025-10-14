import { PickType } from '@nestjs/mapped-types';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class ForgotPasswordDto extends PickType(CreateUserDto, [
  'email',
] as const) {
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(20, { message: 'Password must be at most 20 characters long' })
  password: string;

  @IsString({ message: 'Confirm Password must be a string' })
  @MinLength(6, {
    message: 'Confirm Password must be at least 6 characters long',
  })
  @MaxLength(20, {
    message: 'Confirm Password must be at most 20 characters long',
  })
  confirmPassword: string;
}
