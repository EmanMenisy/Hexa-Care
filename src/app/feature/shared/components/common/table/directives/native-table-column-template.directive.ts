import { Directive, TemplateRef, inject, input } from '@angular/core';

/**
 * Usage from the parent that hosts <hexa-native-table>:
 *
 * <hexa-native-table [columns]="columns" [data]="data" [actions]="actions">
 *   <ng-template hexaColumnTemplate="status" let-value let-row="row" let-col="column">
 *     <span class="status-pill" [ngClass]="value ? 'is-active' : 'is-inactive'">
 *       {{ (value ? 'shared.active' : 'shared.notActive') | translate }}
 *     </span>
 *   </ng-template>
 * </hexa-native-table>
 *
 * `hexaColumnTemplate` must match `col.field` exactly. The template context exposes:
 *  - $implicit / value -> rowData[col.field]
 *  - row               -> the full row object
 *  - column            -> the column definition (INativeTableColumn)
 */
@Directive({
  selector: '[hexaColumnTemplate]',
  standalone: true,
})
export class NativeTableColumnTemplateDirective {
  field = input.required<string>({ alias: 'hexaColumnTemplate' });
  templateRef = inject<TemplateRef<any>>(TemplateRef);
}
