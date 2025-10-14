/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { ForgotPasswordDto } from './dto/forgorPassword.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
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

  async register(registerDto: CreateUserDto) {
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

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserEntity | null> {
    const user = await this.usersService.getUserByEmail(email);
    const isPasswordMatched = await this.compareHash(password, user.password);

    if (!isPasswordMatched) {
      return null;
    }

    return user;
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const decoded = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });

      const user = await this.usersService.getUser(decoded['id']);

      if (!user.refreshToken) {
        throw new UnauthorizedException('Unauthorize user');
      }

      const isTokenValid = await this.compareHash(
        refreshTokenDto.refreshToken,
        user.refreshToken,
      );

      if (!isTokenValid) {
        throw new UnauthorizedException('Invalid user token');
      }

      const tokens = await this.generateToken(user);

      const hashedRefreshToken = await this.generateHash(tokens.refreshToken);

      await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

      return tokens;
    } catch {
      throw new UnauthorizedException('Token is not valid');
    }
  }

  async logout(user: UserEntity): Promise<null> {
    const existingUser = await this.usersService.getUserByEmail(user.email);

    await this.usersService.updateRefreshToken(existingUser.id, null);

    return null;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    if (forgotPasswordDto.password !== forgotPasswordDto.confirmPassword) {
      throw new BadRequestException('password and confirm not matched');
    }

    const hashedPassword = await this.generateHash(forgotPasswordDto.password);

    const user = await this.usersService.updatePassword(
      forgotPasswordDto.email,
      hashedPassword,
    );

    if (!user) {
      throw new HttpException(
        'There is a problem while update password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      message: 'password updated successfully',
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
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
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
