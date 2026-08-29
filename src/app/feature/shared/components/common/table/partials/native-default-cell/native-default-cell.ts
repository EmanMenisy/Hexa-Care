import { Component, input } from '@angular/core';
import { ITableHeader } from '../../../../../../../core/models/interface/ItableHeader';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-native-default-cell',
  imports: [CommonModule],
  templateUrl: './native-default-cell.html',
  styleUrl: './native-default-cell.scss',
})
export class NativeDefaultCell {
  value = input<any>();
  dynamicStyle = input<any>();
  column = input<ITableHeader>({} as ITableHeader);
}
