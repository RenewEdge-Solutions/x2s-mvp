import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportEntity, ReportType } from './report.entity';
import { PlantsService } from '../plants/plants.service';
import { HarvestsService } from '../harvests/harvests.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ReportsService {
  private storageDir = path.resolve(process.cwd(), 'storage', 'reports');

  constructor(
    @InjectRepository(ReportEntity) private repo: Repository<ReportEntity>,
    private plants: PlantsService,
    private harvests: HarvestsService,
  ) {
    fs.mkdirSync(this.storageDir, { recursive: true });
  }

  listTypes(): Array<{ key: ReportType; label: string; description: string; format: 'csv' }> {
    return [
      { key: 'inventory_summary', label: 'Inventory Summary', description: 'Active plants by location and strain', format: 'csv' },
      { key: 'harvest_yields', label: 'Harvest Yields', description: 'All harvest lots and yields', format: 'csv' },
    ];
  }

  async list(): Promise<ReportEntity[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async create(type: ReportType): Promise<ReportEntity> {
    const { content, extension } = await this.generate(type);
    const filename = `${type}-${Date.now()}.${extension}`;
    const filePath = path.join(this.storageDir, filename);
    await fs.promises.writeFile(filePath, content);
    const saved = await this.repo.save(this.repo.create({ type, filename, source: 'manual' }));
    return saved;
  }

  async getFilePath(id: string): Promise<{ path: string; filename: string } | null> {
    const report = await this.repo.findOne({ where: { id } });
    if (!report) return null;
    const filePath = path.join(this.storageDir, report.filename);
    return { path: filePath, filename: report.filename };
  }

  async generate(type: ReportType): Promise<{ content: Buffer; extension: string; mime: string }> {
    switch (type) {
      case 'inventory_summary':
        return this.generateInventorySummary();
      case 'harvest_yields':
        return this.generateHarvestYields();
      default:
        throw new Error('Unknown report type');
    }
  }

  private async generateInventorySummary(): Promise<{ content: Buffer; extension: string; mime: string }> {
    const allPlants = await this.plants.findAll();
    const active = allPlants.filter((p: any) => !p.harvested);
    // Group by location and strain
    const map = new Map<string, number>();
    for (const p of active) {
      const key = `${p.location} | ${p.strain}`;
      map.set(key, (map.get(key) || 0) + 1);
    }
    const rows = [['Location', 'Strain', 'Count']];
    for (const [key, count] of Array.from(map.entries()).sort()) {
      const [location, strain] = key.split(' | ');
      rows.push([location, strain, String(count)]);
    }
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    return { content: Buffer.from(csv, 'utf8'), extension: 'csv', mime: 'text/csv' };
  }

  private async generateHarvestYields(): Promise<{ content: Buffer; extension: string; mime: string }> {
    const all = await this.harvests.findAll();
    const rows = [['Harvest ID', 'Plant ID', 'Status', 'Yield (g)', 'Harvested At']];
    for (const h of all) {
      rows.push([h.id, h.plantId, h.status, String(h.yieldGrams), new Date(h.harvestedAt).toISOString()]);
    }
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    return { content: Buffer.from(csv, 'utf8'), extension: 'csv', mime: 'text/csv' };
  }
}
