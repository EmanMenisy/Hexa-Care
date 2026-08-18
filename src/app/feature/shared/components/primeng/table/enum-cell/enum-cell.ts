import { Component, Input } from '@angular/core';
import { ITableHeader } from '../../../../../../core/models/interface/ItableHeader';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'hexa-enum-cell',
  imports: [CommonModule , TranslatePipe],
  templateUrl: './enum-cell.html',
  styleUrl: './enum-cell.scss',
})
export class EnumCell {
  @Input() value: any;
  @Input() column: ITableHeader = {} as ITableHeader;
}
