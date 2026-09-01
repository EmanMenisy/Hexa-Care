import { Component, effect, inject, input, output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { HeaderButton, HeaderMenuItem, HeaderTab } from './models/header-config.model';
import { TranslatePipe } from '@ngx-translate/core';
import { MenuModule } from 'primeng/menu';
import { ButtonComponent } from '../../components/primeng/button/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hexa-sub-header',
    imports: [CommonModule, RouterLink, RouterLinkActive, ButtonComponent, TranslatePipe, MenuModule],
  templateUrl: './hexa-sub-header.html',
  styleUrl: './hexa-sub-header.scss',
})
export class HexaSubHeader {
 // ---- Content ----
  icon = input<string>('');
  title = input<string>('');
  subtitle = input<string>('');

  tabs = input<HeaderTab[]>([]);

  buttons = input<HeaderButton[]>([]);

  subTabs = input<HeaderTab[]>([]);

  action = output<string>();

  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      this.buttons().forEach((btn) => {
        if (btn.type === 'toggle' && !btn.currentState) {
          const defaultState = btn.toggleStates?.find((s) => s.value === btn.defaultState);
          btn.currentState = defaultState || btn.toggleStates?.[0];
        }
      });
    });
  }

  isButtonVisible(btn: HeaderButton): boolean {
    if (btn.visible === false) return false;
    if (btn.showOnRoute && !this.router.url.includes(btn.showOnRoute)) return false;
    return true;
  }

  isButtonDisabled(btn: HeaderButton): boolean {
    return !!btn.disabled;
  }

  isTabVisible(tab: HeaderTab): boolean {
    return tab.visible !== false;
  }

  getVisibleMenuItems(items: HeaderMenuItem[] | undefined): HeaderMenuItem[] {
    return (items ?? []).filter((item) => item.visible !== false);
  }

  handleMenuItemClick(item: HeaderMenuItem): void {
    if (item.disabled) return;

    if (item.action) {
      this.action.emit(item.action);
    }
    if (item.route) {
      this.router.navigateByUrl(item.route);
    }
  }

  handleAction(btn: HeaderButton): void {
    if (btn.disabled || !btn.action) return;
    this.action.emit(btn.action);
  }

  toggleButton(btn: HeaderButton): void {
    if (btn.type !== 'toggle' || !btn.toggleStates?.length) return;

    const currentIndex = btn.toggleStates.findIndex((s) => s.value === btn.currentState?.value);
    const nextIndex = (currentIndex + 1) % btn.toggleStates.length;
    btn.currentState = btn.toggleStates[nextIndex];

    this.action.emit(`${btn.action}:${btn.currentState.value}`);
  }
}
