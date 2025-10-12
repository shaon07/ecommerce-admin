import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString({ message: 'refreshToken Must be String' })
  @IsNotEmpty({ message: 'refreshToken Can not be empty' })
  refreshToken: string;
}
