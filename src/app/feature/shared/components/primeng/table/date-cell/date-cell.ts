import { Component, Input } from '@angular/core';
import { ITableHeader } from '../../../../../../core/models/interface/ItableHeader';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'hexa-date-cell',
  imports: [CommonModule],
  templateUrl: './date-cell.html',
  styleUrl: './date-cell.scss',
})
export class DateCell {
@Input() value: any;
@Input() column: ITableHeader = {} as ITableHeader;
}
