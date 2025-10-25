import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorators';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserEntity } from 'src/users/entities/user.entity';
import { USER_ROLE } from 'src/users/enums/roles.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersService } from './orders.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @Get()
  async getAllOrders() {
    return await this.orderService.getAllOrders();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(USER_ROLE.USER)
  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: UserEntity,
  ) {
    return await this.orderService.createOrder(user.id, createOrderDto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(USER_ROLE.ADMIN)
  @Patch(':id')
  async updateOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return await this.orderService.updateOrderStatus(id, updateOrderDto);
  }
}
