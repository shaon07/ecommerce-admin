import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@Request() request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return request['user'];
  }

  @Get(':id')
  async getUser(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.getUser(id);
  }

  @UseGuards(JwtGuard)
  @Get()
  async getAllUsers(): Promise<UserEntity[]> {
    return await this.usersService.getAllUsers();
  }
}
