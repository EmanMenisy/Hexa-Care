import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  forwardRef,
  input,
  output
} from '@angular/core';
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

  // Keep this as a normal property because it is managed by CVA/ngModel
  selectedValues: any[] = [];


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

  selectAll = input<boolean>(false);

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

  checkRtl = false;

  selectedItemsLabel = '{0} SelectedItems';


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
      .subscribe(() => {
        this.setTranslations();
      });

    this.cdr.detectChanges();
  }


  ngAfterViewInit(): void {

    this.cdr.detectChanges();
  }


  // ============================================================
  // MULTI SELECT EVENTS
  // ============================================================

  onMultiSelectChange(): void {

    this.multiSelectChanged.emit(
      this.selectedValues
    );

    this.onChange(
      this.selectedValues
    );

    this.onTouched(
      this.selectedValues
    );
  }


  onClear(): void {

    this.selectedValues = [];

    this.multiSelectChanged.emit(
      this.selectedValues
    );

    this.onChange(
      this.selectedValues
    );

    this.onTouched(
      this.selectedValues
    );
  }


  // ============================================================
  // CONTROL VALUE ACCESSOR
  // ============================================================

  onChange = (value: any): any => value;

  onTouched = (value: any): any => value;


  writeValue(object: any): void {

    this.selectedValues = object ?? [];
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