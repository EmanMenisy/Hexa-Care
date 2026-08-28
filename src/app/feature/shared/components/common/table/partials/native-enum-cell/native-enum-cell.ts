import { Component, input } from '@angular/core';
import { ITableHeader } from '../../../../../../../core/models/interface/ItableHeader';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-native-enum-cell',
  imports: [CommonModule,TranslatePipe],
  templateUrl: './native-enum-cell.html',
  styleUrl: './native-enum-cell.scss',
})
export class NativeEnumCell {
  value = input<any>();
  column = input<ITableHeader>({} as ITableHeader);
}
