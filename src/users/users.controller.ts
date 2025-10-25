/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorators';
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
  getMe(@CurrentUser() user) {
    return user;
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  @Get('/orders')
  async getOrderDetails(@CurrentUser() user: UserEntity) {
    return await this.usersService.getOrderDetail(user.id);
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
  async updateUser(@Body() updateUserDto: UpdateUserDto, @CurrentUser() user) {
    return await this.usersService.updateUser(updateUserDto, user.id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(USER_ROLE.ADMIN)
  @Delete('soft-delete/:id')
  async softDeleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.softDeleteUser(id);
  }

  @UseGuards(JwtGuard)
  @Delete('delete/:id')
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.deleteUser(id);
  }
}
