import { FeatureService } from './../../../../core/services/features/features';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonComponent } from '../../components/primeng/button/button';
import { TranslatePipe } from '@ngx-translate/core';
import { MenuModule } from 'primeng/menu';
import { HeaderMenuItem, PageHeaderConfig } from './models/sub-header-config.model';
import { HeaderActionService } from './services/header-action.service';
import { HeaderButtonStateService } from './services/header-button-state.service';

@Component({
  selector: 'app-sub-header',
  imports: [CommonModule, RouterLink, RouterLinkActive, ButtonComponent, TranslatePipe, MenuModule],
  templateUrl: './sub-header.html',
  styleUrl: './sub-header.scss',
})
export class SubHeader {
  // 🆕 signal-based inputs/outputs بدل @Input/@Output
  config = input<PageHeaderConfig | null>(null);
  action = output<string>();



  constructor(
    private readonly router:Router,
    private readonly featureService:FeatureService,
    private readonly headerActionService:HeaderActionService,
    private readonly headerButtonStateService:HeaderButtonStateService,
  ) {
    effect(() => {
      const cfg = this.config();
      cfg?.buttons?.forEach((btn: any) => {
        if (btn.type === 'toggle' && !btn.currentState) {
          const defaultState = btn.toggleStates?.find((s: any) => s.value === btn.defaultState);
          btn.currentState = defaultState || btn.toggleStates?.[0];
        }
      });
    });
  }

  isRouteActive(routePath: string | undefined): boolean {
    if (!routePath) return true;
    return this.router.url.includes(routePath);
  }

  // 🆕 هل الزرار يظهر: مش hidden من الـ state service + معاه permission + على الـ route الصح
  isButtonVisible(btn: any): boolean {
    if (btn.feature && !this.featureService.hasFeature(btn.feature)) return false;
    if (this.headerButtonStateService.isHidden(btn.action)) return false;
    if (!this.isRouteActive(btn.showOnRoute)) return false;
    return true;
  }

  isButtonDisabled(btn: any): boolean {
    return this.headerButtonStateService.isDisabled(btn.action);
  }

  // 🆕 بيرجع الـ menu items بعد فلترتها حسب الـ feature permission + hidden state
  getVisibleMenuItems(items: HeaderMenuItem[] | undefined): HeaderMenuItem[] {
    if (!items) return [];
    return items
      .filter(item => !item.feature || this.featureService.hasFeature(item.feature))
      .filter(item => !this.headerButtonStateService.isHidden(item.action))
      .map(item => ({
        ...item,
        disabled: this.headerButtonStateService.isDisabled(item.action),
      }));
  }

  // 🆕 هاندلر لضغطة أي item جوه المنيو
  handleMenuItemClick(item: HeaderMenuItem): void {
    if (item.feature && !this.featureService.hasFeature(item.feature)) return;
    if (this.headerButtonStateService.isDisabled(item.action)) return;

    if (item.action) {
      this.headerActionService.triggerAction(item.action);
    }
    if (item.route) {
      this.router.navigateByUrl(item.route);
    }
  }

  handleAction(btn: any): void {
    if (btn.feature && !this.featureService.hasFeature(btn.feature)) return;
    if (this.headerButtonStateService.isDisabled(btn.action)) return;
    this.headerActionService.triggerAction(btn.action);
  }

  toggleButton(btn: any): void {
    if (btn.type !== 'toggle') return;

    const states = btn.toggleStates;
    const currentIndex = states.findIndex((s: any) => s.value === btn.currentState?.value);
    const nextIndex = (currentIndex + 1) % states.length;
    btn.currentState = states[nextIndex];

    this.headerActionService.triggerAction(`${btn.action}:${btn.currentState.value}`);
  }
}
