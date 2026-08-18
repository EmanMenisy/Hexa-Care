import { CommonModule } from '@angular/common';
import { Component, input, output, model } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'hexa-button',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './button.html',
  styleUrls: ['./button.scss'],
})
export class ButtonComponent {
  icon = input<string>();
  type = input<'submit' | 'button'>('button');
  iconPos = input<'right' | 'left'>('left');
  styleType = input<
    | 'primary'
    | 'secondary'
    | 'third'
    | 'fourth'
    | 'teal'
    | 'add-other'
    | 'reset'
    | 'cancel'
    | 'transparent'
    | 'sort'
    | 'filter'
    | 'warning'
    | 'danger'
    | 'exit'
    | 'success'
  >('primary');
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

  clicked = output<any>();
  actionIconClick = output<any>();

  onClick(value: any): void {
    this.clicked.emit(value);
  }
  onActionIconClick(value: any): void {
    this.actionIconClick.emit(value);
  }
}