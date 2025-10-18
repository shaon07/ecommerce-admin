import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly categoryService: CategoriesService,
  ) {}

  async getProductById(id: string) {
    const product = await this.productRepository.findOne({
      where: {
        id: id,
      },
      relations: ['categories'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async createProduct(createProductDto: CreateProductDto) {
    const verifyCategoryIds = await this.categoryService.findByIds(
      createProductDto.categories,
    );

    if (verifyCategoryIds.length !== createProductDto.categories.length) {
      throw new BadRequestException('Some category Ids are not valid');
    }

    const product = this.productRepository.create({
      ...createProductDto,
      categories: verifyCategoryIds,
    });

    await this.productRepository.save(product);

    return await this.getProductById(product.id);
  }

  async getProducts() {
    const products = await this.productRepository.find();

    return products;
  }

  async updateProduct(updateProductDto: UpdateProductDto) {
    const validCategoryIds = await this.categoryService.findByIds(
      updateProductDto.categories || [],
    );
  }
}
