import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Skelton } from '../../skelton/skelton';
@Component({
  selector: 'opus-table-loading',
  standalone: true,
  imports: [CommonModule , Skelton],
  templateUrl: './table-loading.html',
  styleUrls: ['./table-loading.scss'],
})
export class TableLoadingComponent {
  numberOfRows: number = 10;
  numberOfColumns: number = 6;
  showPaginationSkelton = true;

  rows: number[] = [];
  columns: number[] = [];

  ngOnInit(): void {
    this.rows = Array(this.numberOfRows)
      .fill(0)
      .map((x, i) => i);
    this.columns = Array(this.numberOfColumns)
      .fill(0)
      .map((x, i) => i);
  }

  /**
   * this simple function created for tracking elements in controls categories list
   * @param index, index of every item in list
   * @returns returns index identifier for this element.
   */
  trackByIndex(index: number): number {
    return index;
  }
}
