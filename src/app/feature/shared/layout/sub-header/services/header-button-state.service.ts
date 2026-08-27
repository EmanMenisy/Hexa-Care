import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export interface ButtonState {
  hidden?: boolean;
  disabled?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HeaderButtonStateService {

  private states = new Map<string, ButtonState>();

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.clear());
  }

  setState(key: string, state: ButtonState): void {
    this.states.set(key, { ...this.states.get(key), ...state });
  }

  getState(key: string | undefined): ButtonState {
    if (!key) return {};
    return this.states.get(key) ?? {};
  }

  isHidden(key: string | undefined): boolean {
    return !!this.getState(key).hidden;
  }

  isDisabled(key: string | undefined): boolean {
    return !!this.getState(key).disabled;
  }

  clear(): void {
    this.states.clear();
  }
}
