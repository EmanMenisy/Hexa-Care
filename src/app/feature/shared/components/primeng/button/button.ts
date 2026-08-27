import { CommonModule } from '@angular/common';
import { Component, input, output, model } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule} from 'primeng/button';
import type { ButtonSeverity } from 'primeng/button';
@Component({
  selector: 'hexa-button',
  standalone: true,
  imports: [CommonModule, ButtonModule , RouterModule],
  templateUrl: './button.html',
  styleUrls: ['./button.scss'],
})
export class ButtonComponent {
  icon = input<string>();
  type = input<'submit' | 'button'>('button');
  iconPos = input<'right' | 'left' |'center'>('left');
  isSortingApplied = input<boolean>(false);
  label = input<string>();
  styleClass = input<string>();
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  loadingIcon = input<string>();
  badge = input<string>();
  badgeClass = input<string>();
  routerLink = input<string>();
  actionIcon = input<string>();
  iconType = input<'image' | 'icon'>('icon');
  severity = input<ButtonSeverity>();
  clicked = output<any>();
  actionIconClick = output<any>();

  onClick(value: any): void {
    this.clicked.emit(value);
  }
  onActionIconClick(value: any): void {
    this.actionIconClick.emit(value);
  }
}