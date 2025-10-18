/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createSlug } from 'src/utilies';
import { In, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    try {
      const existingCategory = await this.categoryRepository.findOneBy({
        name: createCategoryDto.name,
      });

      if (existingCategory) {
        throw new ConflictException(
          `Category ${createCategoryDto.name} is already exist`,
        );
      }

      const category = this.categoryRepository.create(createCategoryDto);

      category.slug = createSlug(category.name);

      return await this.categoryRepository.save(category);
    } catch (error) {
      throw new HttpException(
        error?.message || 'There was an problem while creating category',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCategoryById(id: string) {
    const category = await this.categoryRepository.findOneBy({ id });

    if (!category) {
      throw new NotFoundException('category not found or invalid category');
    }

    return category;
  }

  async getAllCategories() {
    try {
      return await this.categoryRepository.find();
    } catch (error) {
      throw new HttpException(error, error?.status);
    }
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    const existingCategory = await this.categoryRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!existingCategory) {
      throw new NotFoundException('Category not found or invalid category');
    }

    Object.assign(existingCategory, updateCategoryDto);
    await this.categoryRepository.save(existingCategory);

    return await this.getCategoryById(existingCategory.id);
  }

  async softDeleteCategory(id: string) {
    const existingCategory = await this.getCategoryById(id);

    try {
      await this.categoryRepository.softDelete({ id: existingCategory.id });
      return {
        message: 'category deleted successfully',
      };
    } catch (error) {
      throw new HttpException(error?.message, error?.status);
    }
  }

  async findByIds(ids: string[]) {
    const categories = await this.categoryRepository.find({
      where: {
        id: In(ids),
      },
    });

    return categories;
  }
}
