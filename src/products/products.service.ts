import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { CategoryEntity } from 'src/categories/entities/category.entity';
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
    const products = await this.productRepository.find({
      relations: ['categories'],
    });

    return products;
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    let validCategoryIds: CategoryEntity[] = [];

    if (
      Array.isArray(updateProductDto?.categories) &&
      updateProductDto?.categories?.length > 0
    ) {
      validCategoryIds = await this.categoryService.findByIds(
        updateProductDto.categories || [],
      );

      if (validCategoryIds.length !== updateProductDto.categories?.length) {
        throw new BadRequestException('some of categories ids not valid');
      }
    }

    const existingProduct = await this.getProductById(id);

    Object.assign(existingProduct, updateProductDto);

    if (validCategoryIds.length > 0) {
      existingProduct.categories = validCategoryIds;
    }

    await this.productRepository.save(existingProduct);

    return await this.getProductById(existingProduct.id);
  }
}
