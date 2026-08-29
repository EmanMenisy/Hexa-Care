import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';
import { SubHeader } from '../sub-header/sub-header';
import { PageHeaderConfig } from '../sub-header/models/sub-header-config.model';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Sidebar, Header, SubHeader],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  isSidebarOpen = signal<boolean>(false);

  headerConfig = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.getDeepestRouteHeaderConfig())
    ),
    { initialValue: this.getDeepestRouteHeaderConfig() }
  );

  toggleSidebar(): void {
    this.isSidebarOpen.update(open => !open);
  }

  private getDeepestRouteHeaderConfig(): PageHeaderConfig | null {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return (route.snapshot?.data?.['header'] as PageHeaderConfig) ?? null;
  }
}