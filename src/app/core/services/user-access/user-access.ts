import { Injectable, inject } from '@angular/core';
import { FeatureService } from '../features/features';
import { Module } from '../../../feature/Login/models/login-model';

@Injectable({
  providedIn: 'root',
})
export class UserAccessService {
  private readonly featureService = inject(FeatureService);

  /**
   * The required order of modules in the application.
   */
  private readonly modulesOrder = [9, 6, 1, 3, 5, 7, 8, 2, 4];
  private sortedModules: Module[] = [];
  /**
   * Initialize user's modules, pages, and features
   * after a successful login.
   */
  initialize(modules: Module[]): void {
    // Sort modules only.
    this.sortedModules = this.sortModules(modules);

    // Keep pages and features in the same order
    // received from the backend.
    const pageCodes = this.getPageCodes( this.sortedModules );
    const featureCodes = this.getFeatureCodes(this.sortedModules );

    // Store access data.
    this.storeModules(this.sortedModules );
    this.storePages(pageCodes);
    this.storeFeatures(featureCodes);

    // Keep access data available in memory.
    this.featureService.userPages = pageCodes;
    this.featureService.userFeatures = featureCodes;
  }

  /**
   * Sort modules according to the predefined application order.
   */
  private sortModules(modules: Module[]): Module[] {
    const orderMap = new Map(
      this.modulesOrder.map((code, index) => [code, index])
    );

    return [...modules].sort((a, b) => {
      const aOrder =
        orderMap.get(Number(a.code)) ?? Number.MAX_SAFE_INTEGER;

      const bOrder =
        orderMap.get(Number(b.code)) ?? Number.MAX_SAFE_INTEGER;

      return aOrder - bOrder;
    });
  }

  /**
   * Get page codes without sorting them.
   *
   * Pages keep the order returned by the backend.
   */
  private getPageCodes(modules: Module[]): number[] {
    return modules.flatMap((module) =>
      module.pages.map((page) => Number(page.code))
    );
  }

  /**
   * Get feature codes without sorting them.
   *
   * Features keep the order returned by the backend.
   */
  private getFeatureCodes(modules: Module[]): number[] {
    return modules.flatMap((module) =>
      module.pages.flatMap((page) =>
        page.features.map((feature) => Number(feature.code))
      )
    );
  }

  private storeModules(modules: Module[]): void {
    localStorage.setItem(
      'modules',
      JSON.stringify(modules)
    );
  }

  private storePages(pageCodes: number[]): void {
    localStorage.setItem(
      'pagesCode',
      JSON.stringify(pageCodes)
    );
  }

  private storeFeatures(featureCodes: number[]): void {
    localStorage.setItem(
      'features',
      JSON.stringify(featureCodes)
    );
  }

  getModules(): Module[] {
    return this.sortedModules;
  }
}
