import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  forwardRef,
  inject,
  input,
  model,
  output
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormsModule,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { Localization } from '../../../../../core/services/localization/localization';

@Component({
  selector: 'hexa-multi-select',
  standalone: true,
  imports: [
    MultiSelectModule,
    NgClass,
    FormsModule
  ],
  templateUrl: './multi-select.html',
  styleUrls: ['./multi-select.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true
    }
  ]
})
export class MultiSelectComponent implements OnInit, AfterViewInit {

  // ============================================================
  // VALUE CONTROL
  // ============================================================

  /**
   * Used when the multi-select is consumed outside Reactive Forms.
   *
   * Supports:
   *
   * [(selectedValues)]="selectedRoleIds"
   *
   * or:
   *
   * [selectedValues]="selectedRoleIds()"
   *
   * Also written to by writeValue() when used inside Reactive
   * Forms via formControlName.
   */
  readonly selectedValues = model<any[]>([]);


  // ============================================================
  // INPUTS
  // ============================================================

  options = input<any[]>([]);

  optionLabel = input<string>('label');

  optionValue = input<string>('value');

  placeholder = input<string>('');

  showHeader = input<boolean>(true);

  showToggleAll = input<boolean>(true);

  disabled = input<boolean>(false);

  readonly = input<boolean>(false);

  showClear = input<boolean>(false);

  hasError = input<boolean>(false);

  maxSelectedLabels = input<number>(30);

  virtualScroll = input<boolean>(false);

  itemSize = input<number>(30);

  emptyMessage = input<string>('');

  emptyFilterMessage = input<string>('');

  serverSideFiltering = input<boolean>(false);


  // ============================================================
  // INTERNAL VALUES
  // ============================================================

  placeholderText = '';

  emptyMessageText = '';

  emptyFilterMessageText = '';


  // ============================================================
  // OUTPUTS
  // ============================================================

  multiSelectChanged = output<any[]>();

  multiSelectShown = output<void>();

  multiSelectHidden = output<void>();


  // ============================================================
  // OTHER PROPERTIES
  // ============================================================

  selectedItemsLabel = '{0} SelectedItems';


  /**
   * Used to auto-unsubscribe from the langChange
   * subscription when the component is destroyed.
   */
  private readonly destroyRef = inject(DestroyRef);


  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly translate: Localization
  ) {
    // This is intentional
  }


  // ============================================================
  // LIFECYCLE
  // ============================================================

  ngOnInit(): void {

    this.setTranslations();

    this.translate
      .onLangChange()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.setTranslations();
      });
  }


  ngAfterViewInit(): void {

    this.cdr.detectChanges();
  }


  // ============================================================
  // MULTI SELECT EVENTS
  // ============================================================

 onMultiSelectChange(value: any[]): void {
  this.selectedValues.set(value);
  this.multiSelectChanged.emit(value);
  this.onChange(value);
  this.onTouched(value);
}


  onClear(): void {

    this.selectedValues.set([]);

    this.multiSelectChanged.emit(
      this.selectedValues()
    );

    this.onChange(
      this.selectedValues()
    );

    this.onTouched(
      this.selectedValues()
    );
  }


  // ============================================================
  // CONTROL VALUE ACCESSOR
  // ============================================================

  onChange = (value: any): any => value;

  onTouched = (value: any): any => value;


  writeValue(object: any): void {

    this.selectedValues.set(object ?? []);
  }


  registerOnChange(fn: any): void {

    this.onChange = fn;
  }


  registerOnTouched(fn: any): void {

    this.onTouched = fn;
  }


  // ============================================================
  // TRANSLATIONS
  // ============================================================

  setTranslations(): void {

    this.placeholderText =
      this.placeholder() || ' ';

    this.emptyMessageText =
      this.emptyMessage() ||
      this.translate.instant(
        'shared.dropdown.noItems'
      );

    this.emptyFilterMessageText =
      this.emptyFilterMessage() ||
      this.translate.instant(
        'shared.dropdown.noItems'
      );
  }
}