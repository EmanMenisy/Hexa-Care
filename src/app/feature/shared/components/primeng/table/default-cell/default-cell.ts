import { Component, Input } from '@angular/core';
import { ITableHeader } from '../../../../../../core/models/interface/ItableHeader';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'hexa-default-cell',
  imports: [CommonModule , TranslatePipe],
  templateUrl: './default-cell.html',
  styleUrl: './default-cell.scss',
})
export class DefaultCell {
  @Input() value: any;
  @Input() dynamicStyle: any;
  @Input() column: ITableHeader = {} as ITableHeader;
}
