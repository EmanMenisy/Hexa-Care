import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

import { PopoverModule } from 'primeng/popover';

import { ITableHeader } from '../../../../../../../core/models/interface/ItableHeader';

@Component({
  selector: 'app-native-list-cell',
  imports: [PopoverModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './native-list-cell.html',
  styleUrl: './native-list-cell.scss',
})
export class NativeListCell {
  column = input<ITableHeader>({} as ITableHeader);
  value = input<unknown>();

  private items = computed<string[]>(() => {
    const value = this.value();

    if (Array.isArray(value)) {
      return value
        .filter(Boolean)
        .map(String);
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
    }

    return [];
  });

  firstItem = computed(() => this.items()[0] ?? '-');

  restItems = computed(() => this.items().slice(1));
}