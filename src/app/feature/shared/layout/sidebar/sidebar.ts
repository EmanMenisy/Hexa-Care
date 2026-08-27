import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { ISidebarItem } from './models/sidebarItem.model';
import { SIDEBAR_MENU } from './models/sidebar-config.model';
import { SidebarItemComponent } from './sidebar-item/sidebar-item';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [SidebarItemComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  isOpen = input(false);
  items: ISidebarItem[] = [];

  toggle = output<void>();

  private router = inject(Router);

  ngOnInit(): void {
    this.items = this.getAllowedSidebarModules();
  }

  /** current URL as a signal, so active state updates on every navigation */
  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** which module id is currently expanded (only one open at a time) */
  private expandedId = signal<string | null>(null);

  /** explicit flag → single clickable link, no dropdown (falls back to "no children" too) */
  isSinglePage(item: ISidebarItem): boolean {
    return item.standalone === true || !item.children?.length;
  }

  isExpanded(item: ISidebarItem): boolean {
    return this.expandedId() === item.id;
  }

  isItemActive(item: ISidebarItem): boolean {
    return !!item.route && this.currentUrl().startsWith(item.route);
  }

  /** parent row lights up if it's the active page itself, or one of its children is */
  isModuleActive(item: ISidebarItem): boolean {
    if (this.isItemActive(item)) return true;
    return !!item.children?.some((child) => this.isItemActive(child));
  }

  onItemClick(item: ISidebarItem): void {
    if (this.isSinglePage(item)) return; // routerLink handles navigation itself
    this.expandedId.set(this.isExpanded(item) ? null : item.id);
  }

  private getAllowedSidebarModules(): ISidebarItem[] {
    const stored = localStorage.getItem('modules');
    if (!stored) return [];

    let backendModules: any[] = [];
    try {
      backendModules = JSON.parse(stored);
    } catch {
      return [];
    }

    const result: ISidebarItem[] = [];

    backendModules.forEach((backendModule) => {
      // backend sends codes as strings ("9") — cast to number to match SIDEBAR_MENU
      const backendModuleCode = Number(backendModule.code);
      const localModule = SIDEBAR_MENU.find((m) => m.code === backendModuleCode);
      if (!localModule) return;

      // standalone module → single link, nothing to filter on children,
      // being present in backendModules is enough permission to show it.
      if (localModule.standalone) {
        result.push({ ...localModule });
        return;
      }

      // expandable module → keep only the children the backend allows
      const filteredChildren = (localModule.children ?? []).filter((localChild) =>
        backendModule.pages?.some(
          (backendChild: any) => Number(backendChild.code) === localChild.code,
        ),
      );

      // no allowed pages left under this module → don't show it at all
      if (!filteredChildren.length) return;

      result.push({
        ...localModule,
        children: filteredChildren,
      });
    });

    return result;
  }
}