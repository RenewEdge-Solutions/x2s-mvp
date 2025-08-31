import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InventoryService, CreateInventoryItemDto } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(@Body() createInventoryItemDto: CreateInventoryItemDto) {
    return this.inventoryService.create(createInventoryItemDto);
  }

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.inventoryService.findByCategory(category);
  }

  @Get('category/:category/subcategory/:subcategory')
  findBySubcategory(@Param('category') category: string, @Param('subcategory') subcategory: string) {
    return this.inventoryService.findBySubcategory(category, subcategory);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInventoryItemDto: Partial<CreateInventoryItemDto>) {
    return this.inventoryService.update(id, updateInventoryItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}
