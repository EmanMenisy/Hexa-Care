import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ISidebarItem } from '../models/sidebarItem.model';

@Component({
  selector: 'app-sidebar-item',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sidebar-item.html',
  styleUrl: './sidebar-item.scss',
})
export class SidebarItemComponent {
  item = input.required<ISidebarItem>();

  /** is the whole sidebar expanded (showing labels), not this item's own state */
  isOpen = input(false);

  /** true for rows rendered inside a submenu */
  isChild = input(false);

  /** true → render as a plain link, false → render as an expand/collapse trigger */
  isSinglePage = input(false);

  /** whether this module's dropdown is currently open */
  isExpanded = input(false);

  /** whether this item (or one of its children) is the active route */
  isActive = input(false);

  itemClick = output<void>();

  /**
   * The route this row actually navigates to when it's a single-page link.
   * Uses the item's own `route` if it has one; otherwise falls back to its
   * first child's route (handy for `standalone: true` items that wrap a
   * single child instead of duplicating the route on the parent).
   */
  route = computed(() => this.item().route ?? this.item().children?.[0]?.route);
}
