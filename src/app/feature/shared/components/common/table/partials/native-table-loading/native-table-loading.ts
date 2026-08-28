import { Component, computed, input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-native-table-loading',
  imports: [SkeletonModule],
  templateUrl: './native-table-loading.html',
  styleUrl: './native-table-loading.scss',
})
export class NativeTableLoading {
  numberOfRows = input<number>(10);
  numberOfColumns = input<number>(6);
  showPaginationSkelton = input<boolean>(true);

  rows = computed(() => Array.from({ length: this.numberOfRows() }, (_, i) => i));
  columns = computed(() => Array.from({ length: this.numberOfColumns() }, (_, i) => i));
}
