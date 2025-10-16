/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { USER_ROLE } from './enums/roles.enum';
import { UsersService } from './users.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@Request() request) {
    return request['user'];
  }

  @Get(':id')
  async getUser(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.getUser(id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(USER_ROLE.ADMIN)
  @Get()
  async getAllUsers(): Promise<UserEntity[]> {
    return await this.usersService.getAllUsers();
  }

  @UseGuards(JwtGuard)
  @Patch()
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Request() request) {
    return await this.usersService.updateUser(
      updateUserDto,
      request['user'].id,
    );
  }
}
