import { Injectable } from '@angular/core';
import { Feature } from '../../models/enums/features';
import { page } from '../../models/enums/page';

@Injectable({
  providedIn: 'root',
})
export class FeatureService {
   userFeatures: number[] = [];
   userPages: number[] = [];

  constructor() {
    this.loadFeaturesFromLocalStorage();
    this.loadPagesFromLocalStorage();
  }

  /**
   * Load features from local storage and store in global variable
   */
  loadFeaturesFromLocalStorage(): void {
    const storedFeatures = localStorage.getItem('features');
    if (storedFeatures) {
      this.userFeatures = JSON.parse(storedFeatures);
    }
  }
  loadPagesFromLocalStorage(): void {
    const pages = localStorage.getItem('pagesCode');
    if (pages) {
      let codes = JSON.parse(pages);
      this.userPages = codes.map(Number);
    }
  }

  /**
   * Check if user has a specific feature
   * @param feature - Feature enum value
   * @returns true if user has the feature, false otherwise
   *
   */

   //need to handle feature /page enum
  hasFeature(feature: Feature): boolean {
    return this.userFeatures.includes(feature);
  }

  hasPage(page: page): boolean {
    return this.userPages.includes(page);
  }
}
