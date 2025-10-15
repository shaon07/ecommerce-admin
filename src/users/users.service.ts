/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async createUser(@Body() createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: [
        {
          email: createUserDto.email,
        },
        {
          username: createUserDto.username,
        },
      ],
    });

    if (existingUser) {
      throw new ConflictException(
        `User with this ${createUserDto.email === existingUser.email ? 'email' : 'username'} already exists`,
      );
    }
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async getUser(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getAllUsers(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  async updateRefreshToken(id: string, token: string | null) {
    return await this.userRepository.update(
      {
        id: id,
      },
      {
        refreshToken: token,
      },
    );
  }

  async updatePassword(email: string, hashedPassword: string) {
    try {
      const user = await this.getUserByEmail(email);

      user.password = hashedPassword;

      return await this.userRepository.save(user);
    } catch (error) {
      throw new HttpException(
        error?.message || 'Interval Server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
