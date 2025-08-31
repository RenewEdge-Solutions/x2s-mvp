import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from './inventory.entity';

export interface CreateInventoryItemDto {
  name: string;
  category: string;
  subcategory: string;
  itemType?: string;
  quantity: number;
  unit: string;
  location: string;
  supplier?: string;
  purchaseDate?: Date;
  expiryDate?: Date;
  cost?: number;
  specificFields?: Record<string, any>;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
  ) {}

  async create(createInventoryItemDto: CreateInventoryItemDto): Promise<InventoryItem> {
    const inventoryItem = this.inventoryRepository.create(createInventoryItemDto);
    return this.inventoryRepository.save(inventoryItem);
  }

  async findAll(): Promise<InventoryItem[]> {
    return this.inventoryRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<InventoryItem | null> {
    return this.inventoryRepository.findOne({ where: { id } });
  }

  async update(id: string, updateInventoryItemDto: Partial<CreateInventoryItemDto>): Promise<InventoryItem | null> {
    await this.inventoryRepository.update(id, updateInventoryItemDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.inventoryRepository.delete(id);
  }

  async findByCategory(category: string): Promise<InventoryItem[]> {
    return this.inventoryRepository.find({
      where: { category },
      order: { createdAt: 'DESC' }
    });
  }

  async findBySubcategory(category: string, subcategory: string): Promise<InventoryItem[]> {
    return this.inventoryRepository.find({
      where: { category, subcategory },
      order: { createdAt: 'DESC' }
    });
  }

  async reduceQuantity(id: string, amount: number): Promise<InventoryItem | null> {
    const item = await this.findOne(id);
    if (!item) {
      throw new Error('Inventory item not found');
    }
    if (item.quantity < amount) {
      throw new Error('Insufficient quantity available');
    }
    item.quantity -= amount;
    return this.inventoryRepository.save(item);
  }
}
