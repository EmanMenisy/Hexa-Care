import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor(private readonly router: Router, private readonly route: ActivatedRoute) { }

  mapQueryParamsToFilters<T extends Record<string, any>>(params: Params, defaults: T): T {
    const result: Partial<T> = {};

    Object.keys(defaults).forEach((key) => {
      const defaultValue = defaults[key];
      const paramValue = params[key];

      if (paramValue == null || paramValue === '') {
        result[key as keyof T] = defaultValue;
        return;
      }

      // Handle arrays
      if (Array.isArray(defaultValue)) {
        const arr =
          typeof paramValue === 'string'
            ? paramValue.split(',')
            : Array.isArray(paramValue)
              ? paramValue
              : [paramValue];

        // Force numeric conversion when all items are numeric
        const allNumeric = arr.every((v: any) => !isNaN(Number(v)));
        result[key as keyof T] = allNumeric ? arr.map(Number) as any : arr;
        return;
      }

      // Handle numbers
      if (!isNaN(Number(paramValue)) && typeof defaultValue === 'number') {
        result[key as keyof T] = Number(paramValue) as any;
        return;
      }

      // Handle booleans
      if (typeof defaultValue === 'boolean') {
        result[key as keyof T] = (paramValue === 'true' || paramValue === true) as any;
        return;
      }

      // // Handle ISO date strings
      if (typeof defaultValue === 'string' && typeof paramValue === 'string') {
        const isoDatePattern =
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
        if (isoDatePattern.test(paramValue)) {
          result[key as keyof T] = new Date(paramValue) as any;
          return;
        }
      }

      result[key as keyof T] = paramValue as any;
    });

    return result as T;
  }




  saveFiltersInParams<T extends Record<string, any>>(filters: T): void {
    const queryParams: Params = {};

    Object.keys(filters).forEach((key) => {
      const value = filters[key];

      if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
        return; // Skip empty values
      }

      if (Array.isArray(value)) {
        queryParams[key] = value.join(',');
      } else {
        queryParams[key] = value.toString();
      }
    });

    // Navigate with only the new filters (no merge with old params)
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
    });
  }



  countQueryParams<T extends Record<string, any>>(
    params: Params,
    defaults?: T,
    excludedKeys: string[] = []
  ): number {
    let count = 0;
    const allowedKeys = defaults ? Object.keys(defaults) : Object.keys(params);

    Object.keys(params).forEach(key => {
      // Only count keys that are in the defaults (if provided)
      if (!allowedKeys.includes(key)) return;

      // Skip excluded keys
      if (excludedKeys.includes(key)) return;

      const value = params[key];
      if (value == null || value === '') return;

      if (typeof value === 'string' && value.includes(',')) {
        count += value
          .split(',')
          .filter(v => v.trim() !== '')
          .length;
      } else {
        count += 1;
      }
    });
    return count;
  }

  // clean request from null, undefined, empty strings
  cleanRequest<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => {
        if (Array.isArray(v)) return v.length > 0; // Keep non-empty arrays
        if (v === null || v === undefined) return false; // Remove null/undefined
        if (typeof v === 'string') return v.trim() !== ''; // Remove empty strings
        return true; // Keep numbers, booleans, etc.
      })) as Partial<T>;
  }

  buildParams(source: Record<string, any>): HttpParams {
    return Object.entries(source)
      .filter(([, v]) => v !== null && v !== undefined)
      .reduce((p, [k, v]) => p.set(k, String(v)), new HttpParams());
  }
}

