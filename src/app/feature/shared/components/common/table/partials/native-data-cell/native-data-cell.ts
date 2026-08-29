import { Component, input } from '@angular/core';
import { ITableHeader } from '../../../../../../../core/models/interface/ItableHeader';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-native-data-cell',
  imports: [CommonModule, TranslatePipe, DatePipe],
  templateUrl: './native-data-cell.html',
  styleUrl: './native-data-cell.scss',
})
export class NativeDataCell {
  value = input<any>();
  column = input<ITableHeader>({} as ITableHeader);
}
