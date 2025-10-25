import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from 'src/products/entities/product.entity';
import { In, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderEntity } from './entities/order.entity';
import { OrderItem } from './entities/orderItem.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,

    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async getAllOrders() {
    return await this.orderRepository.find({
      relations: ['user', 'orderItems'],
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  async getOrder(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
      },
      relations: ['user', 'orderItems'],
    });

    if (!order) {
      throw new NotFoundException(`order with ${orderId} is not found`);
    }

    return order;
  }

  async createOrder(createOrderDto: CreateOrderDto, userId: string) {
    const productIds = createOrderDto.products.map(
      (product) => product.productId,
    );

    const products = await this.productRepository.find({
      where: {
        id: In(productIds),
      },
    });

    if (productIds.length !== products.length) {
      throw new BadRequestException('Some of product ids are not valid');
    }

    const orderItems: OrderItem[] = products.map((product) => {
      const currentItem = createOrderDto.products.find(
        (p) => p.productId === product.id,
      );

      if (!currentItem) {
        throw new BadRequestException('Some of product ids are not valid');
      }

      const order = this.orderRepository.manager.create(OrderItem, {
        name: product.name,
        price: product.price,
        quantity: currentItem.quantity,
      });

      return order;
    });

    const order = this.orderRepository.create({
      user: {
        id: userId,
      },
      orderItems: orderItems,
    });

    const currentOrder = await this.orderRepository.save(order);

    return await this.getOrder(currentOrder.id);
  }

  async updateOrderStatus(orderId: string, statusDto: UpdateOrderDto) {
    const order = await this.getOrder(orderId);

    this.orderRepository.merge(order, {
      status: statusDto.status,
    });

    await this.orderRepository.save(order);

    return order;
  }
}
