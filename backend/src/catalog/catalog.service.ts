import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CatalogData, Package, Test } from './catalog.types.js';

@Injectable()
export class CatalogService implements OnModuleInit {
  private tests = new Map<string, Test>();
  private packages: Package[] = [];

  onModuleInit() {
    const path = join(process.cwd(), 'data', 'lab-catalog.json');
    try {
      const raw = readFileSync(path, 'utf-8');
      this.load(JSON.parse(raw) as CatalogData);
    } catch (err) {
      throw new Error(
        `Could not load catalog from ${path}: ${(err as Error).message}`,
      );
    }
  }

  load(data: CatalogData) {
    this.tests = new Map(data.tests.map((t) => [t.id, t]));
    this.packages = data.packages.map((p) => ({
      ...p,
      testIds: [...new Set(p.testIds)].filter((id) => this.isSelectable(id)),
    }));
  }

  isSelectable(id: string) {
    return this.tests.get(id)?.status === true;
  }

  getTest(id: string) {
    return this.tests.get(id);
  }

  getTests() {
    return [...this.tests.values()].filter((t) => t.status);
  }

  getActivePackages(): Package[] {
    return this.packages.filter((p) => p.status && p.testIds.length > 0);
  }
}
