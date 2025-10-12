import {
  Body,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(@Body() loginDto: LoginDto) {
    const existingUser = await this.usersService.getUserByEmail(loginDto.email);

    const isPasswordMatched = await this.compareHash(
      loginDto.password,
      existingUser.password,
    );

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Password not valid');
    }

    const tokens = await this.generateToken(existingUser);

    const hashedRefreshToken = await this.generateHash(tokens.refreshToken);

    await this.usersService.updateRefreshToken(
      existingUser.id,
      hashedRefreshToken,
    );

    return {
      data: existingUser,
      tokens,
    };
  }

  async register(@Body() registerDto: CreateUserDto) {
    const hashedPassword = await this.generateHash(registerDto.password);

    const user = await this.usersService.createUser({
      email: registerDto.email,
      name: registerDto.name,
      username: registerDto.username,
      password: hashedPassword,
    });

    const tokens = await this.generateToken(user);

    const hashedRefreshToken = await this.generateHash(tokens.refreshToken);

    if (!tokens || !tokens.refreshToken) {
      throw new ConflictException('There was a problem creating tokens');
    }

    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);
    return {
      data: user,
      tokens,
    };
  }

  private async generateToken(user: UserEntity) {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async generateAccessToken(user: UserEntity): Promise<string> {
    const token = await this.jwtService.signAsync(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '1h',
      },
    );

    return token;
  }

  private async generateRefreshToken(user: UserEntity): Promise<string> {
    const token = await this.jwtService.signAsync(
      {
        id: user.id,
      },
      {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '1d',
      },
    );

    return token;
  }

  private async generateHash(value: string): Promise<string> {
    return await bcrypt.hash(value, 10);
  }

  private async compareHash(
    plainValue: string,
    hashValue: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainValue, hashValue);
  }
}
