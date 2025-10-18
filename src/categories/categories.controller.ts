import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { USER_ROLE } from 'src/users/enums/roles.enum';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(USER_ROLE.ADMIN)
  @Post()
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoriesService.createCategory(createCategoryDto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(USER_ROLE.ADMIN, USER_ROLE.USER)
  @Get()
  async getCategories() {
    return await this.categoriesService.getAllCategories();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(USER_ROLE.ADMIN, USER_ROLE.USER)
  @Get(':id')
  async getCategoriesById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.categoriesService.getCategoryById(id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(USER_ROLE.ADMIN)
  @Patch(':id')
  async updateCategory(
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.categoriesService.updateCategory(id, updateCategoryDto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(USER_ROLE.ADMIN)
  @Delete(':id')
  async softDeleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.softDeleteCategory(id);
  }
}
