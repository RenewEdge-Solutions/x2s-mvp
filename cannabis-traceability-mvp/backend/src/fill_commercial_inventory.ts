import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventoryItem } from './inventory/inventory.entity';

async function fillCommercialInventory() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  try {
    const inventoryRepo = app.get(getRepositoryToken(InventoryItem));

    // Example realistic inventory for a commercial cannabis farm
    const items = [
      // Seeds
      {
        name: 'OG Kush Seeds',
        category: 'Seeds',
        subcategory: 'OG Kush',
        itemType: 'Cannabis',
        quantity: 5000,
        unit: 'seeds',
        location: 'Storage Room 1',
        supplier: 'Royal Queen Seeds',
        purchaseDate: new Date('2025-07-01'),
        cost: 0.50,
        specificFields: { strain: 'OG Kush', batch: 'OGK-2025-07', feminized: true }
      },
      {
        name: 'White Widow Seeds',
        category: 'Seeds',
        subcategory: 'White Widow',
        itemType: 'Cannabis',
        quantity: 3000,
        unit: 'seeds',
        location: 'Storage Room 1',
        supplier: 'Barney’s Farm',
        purchaseDate: new Date('2025-06-15'),
        cost: 0.45,
        specificFields: { strain: 'White Widow', batch: 'WW-2025-06', feminized: true }
      },
      // Nutrients
      {
        name: 'General Hydroponics FloraGro',
        category: 'Nutrients',
        subcategory: 'Vegetative',
        itemType: 'Liquid',
        quantity: 200,
        unit: 'L',
        location: 'Storage Room 2',
        supplier: 'General Hydroponics',
        purchaseDate: new Date('2025-05-10'),
        cost: 12.00,
        specificFields: { NPK: '2-1-6' }
      },
      {
        name: 'Advanced Nutrients Big Bud',
        category: 'Nutrients',
        subcategory: 'Flowering',
        itemType: 'Liquid',
        quantity: 150,
        unit: 'L',
        location: 'Storage Room 2',
        supplier: 'Advanced Nutrients',
        purchaseDate: new Date('2025-05-10'),
        cost: 18.00,
        specificFields: { NPK: '0-1-3' }
      },
      // Growing Media
      {
        name: 'Coco Coir Blocks',
        category: 'Growing Media',
        subcategory: 'Coco Coir',
        itemType: 'Block',
        quantity: 1000,
        unit: 'blocks',
        location: 'Storage Room 1',
        supplier: 'Canna',
        purchaseDate: new Date('2025-04-20'),
        cost: 1.20,
        specificFields: { weightKg: 5 }
      },
      // Packaging
      {
        name: 'Child-Resistant Jars 1oz',
        category: 'Packaging',
        subcategory: 'Jars',
        itemType: 'Plastic',
        quantity: 5000,
        unit: 'pcs',
        location: 'Storage Room 2',
        supplier: 'Greenlane',
        purchaseDate: new Date('2025-08-01'),
        cost: 0.30,
        specificFields: { sizeOz: 1, compliant: true }
      },
      // Harvested Flower
      {
        name: 'OG Kush Dried Flower',
        category: 'Flower',
        subcategory: 'OG Kush',
        itemType: 'Dried',
        quantity: 12000,
        unit: 'g',
        location: 'Drying Room',
        supplier: 'In-house',
        purchaseDate: new Date('2025-08-20'),
        cost: 0.00,
        specificFields: { batch: 'OGK-2025-08', thc: '22%', cbd: '0.8%' }
      },
      {
        name: 'White Widow Dried Flower',
        category: 'Flower',
        subcategory: 'White Widow',
        itemType: 'Dried',
        quantity: 9000,
        unit: 'g',
        location: 'Drying Room',
        supplier: 'In-house',
        purchaseDate: new Date('2025-08-20'),
        cost: 0.00,
        specificFields: { batch: 'WW-2025-08', thc: '19%', cbd: '1.2%' }
      },
      // Trim
      {
        name: 'OG Kush Trim',
        category: 'Trim',
        subcategory: 'OG Kush',
        itemType: 'Dried',
        quantity: 2500,
        unit: 'g',
        location: 'Drying Room',
        supplier: 'In-house',
        purchaseDate: new Date('2025-08-20'),
        cost: 0.00,
        specificFields: { batch: 'OGK-2025-08' }
      },
      // Extracts
      {
        name: 'OG Kush Crude Oil',
        category: 'Extracts',
        subcategory: 'Crude Oil',
        itemType: 'Oil',
        quantity: 1200,
        unit: 'g',
        location: 'Storage Room 2',
        supplier: 'In-house',
        purchaseDate: new Date('2025-08-25'),
        cost: 0.00,
        specificFields: { batch: 'OGK-2025-08', thc: '65%' }
      },
      // Miscellaneous
      {
        name: 'Nitrile Gloves',
        category: 'Supplies',
        subcategory: 'Gloves',
        itemType: 'Nitrile',
        quantity: 10000,
        unit: 'pcs',
        location: 'Storage Room 1',
        supplier: 'Medline',
        purchaseDate: new Date('2025-07-15'),
        cost: 0.05,
        specificFields: { size: 'L', color: 'Blue' }
      },
      {
        name: 'Isopropyl Alcohol 99%',
        category: 'Supplies',
        subcategory: 'Cleaning',
        itemType: 'Liquid',
        quantity: 100,
        unit: 'L',
        location: 'Storage Room 1',
        supplier: 'Fisher Scientific',
        purchaseDate: new Date('2025-07-10'),
        cost: 2.50,
        specificFields: { concentration: '99%' }
      }
    ];

    for (const item of items) {
      await inventoryRepo.save(inventoryRepo.create(item));
    }
    console.log('Commercial cannabis inventory filled successfully!');
  } catch (err) {
    console.error('Inventory fill error:', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

fillCommercialInventory();
