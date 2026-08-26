import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import {  SidebarItem } from './models/sidebarItem.model';
import { SIDEBAR_MENU } from './models/sidebar-config.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  isOpen = input(false);
  items: SidebarItem[] = [];

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

  /** module === page → single clickable link, no dropdown */
  isSinglePage(item: SidebarItem): boolean {
    return !item.children?.length || item.pageCode === item.code;
  }

  isExpanded(item: SidebarItem): boolean {
    return this.expandedId() === item.id;
  }

  isItemActive(item: SidebarItem): boolean {
    return !!item.route && this.currentUrl().startsWith(item.route);
  }

  /** parent row lights up if it's the active page itself, or one of its children is */
  isModuleActive(item: SidebarItem): boolean {
    if (this.isItemActive(item)) return true;
    return !!item.children?.some((child) => this.isItemActive(child));
  }

  onItemClick(item: SidebarItem): void {
    if (this.isSinglePage(item)) return; // routerLink handles navigation itself
    this.expandedId.set(this.isExpanded(item) ? null : item.id);
  }

  private getAllowedSidebarModules(): SidebarItem[] {
    const stored = localStorage.getItem('modules');
    if (!stored) return [];

    let backendModules: any[] = [];
    try {
      backendModules = JSON.parse(stored);
    } catch {
      return [];
    }

    const result: SidebarItem[] = [];

    backendModules.forEach((backendModule) => {
      // backend sends codes as strings ("9") — cast to number to match SIDEBAR_MENU
      const backendModuleCode = Number(backendModule.code);
      const localModule = SIDEBAR_MENU.find((m) => m.code === backendModuleCode);
      if (!localModule) return;

      // module === page → single link, nothing to filter on children,
      // being present in backendModules is enough permission to show it.
      if (localModule.pageCode === localModule.code) {
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