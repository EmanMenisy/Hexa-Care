import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet,Sidebar,Header],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  isSidebarOpen = signal<boolean>(false);
  toggleSidebar(): void {
    this.isSidebarOpen.update(open => !open);
  }
}
