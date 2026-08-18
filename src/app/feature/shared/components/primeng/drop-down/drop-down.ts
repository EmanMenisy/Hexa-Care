import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  OnInit,
  TemplateRef,
  forwardRef,
  input,
  output,
} from '@angular/core';

import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

import { SelectModule } from 'primeng/select';
import { Localization } from '../../../../../core/services/localization/localization';


@Component({
  selector: 'hexa-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    SelectModule,
    FormsModule,
  ],
  templateUrl: './drop-down.html',
  styleUrls: ['./drop-down.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true,
    },
  ],
})
export class DropdownComponent
  implements ControlValueAccessor, OnInit, AfterViewInit {

  // =========================================================
  // Value
  // =========================================================

  selectedValue: any = null;

  // =========================================================
  // Inputs
  // =========================================================

  readonly options = input<any[]>([]);

  readonly optionLabel = input('label');

  readonly optionValue = input('value');

  readonly placeholder = input('');

  readonly showClear = input(false);

  readonly disabled = input(false);

  readonly readonly = input(false);

  readonly virtualScroll = input(false);

  readonly itemSize = input(30);

  readonly useTemplate = input(false);

  readonly emptyMessage = input<string>();

  readonly emptyFilterMessage = input<string>();

  readonly panelStyleClass = input('opus-dropdown-panel');

  readonly filter = input(true);

  readonly filterPlaceholder = input('');

  // =========================================================
  // Internal State
  // =========================================================

  cvaDisabled = false;

  // =========================================================
  // Translations
  // =========================================================

  placeholderText = '';

  emptyMessageText = '';

  emptyFilterMessageText = '';

  filterPlaceholderText = '';

  // =========================================================
  // Icon
  // =========================================================

  dropdownIcon = 'pi pi-chevron-down';

  // =========================================================
  // Templates
  // =========================================================

  @ContentChild('optionTemplate')
  OptionTemplateOutlet?: TemplateRef<any>;

  @ContentChild('selectedTemplate')
  SelectedOptionTemplateOutlet?: TemplateRef<any>;

  // =========================================================
  // Outputs
  // =========================================================

  readonly dropdownChanged = output<any>();

  readonly dropdownShown = output<void>();

  readonly dropdownHidden = output<void>();

  readonly dropdownScrolled = output<string>();

  // =========================================================
  // CVA
  // =========================================================

  onChange = (value: any): void => {};

  onTouched = (): void => {};

  // =========================================================
  // Constructor
  // =========================================================

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly translate: Localization
  ) {}

  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {
    this.setTranslations();

    this.translate.onLangChange().subscribe(() => {
      this.setTranslations();
    });
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  // =========================================================
  // Dropdown Events
  // =========================================================

  onDropdownChange(event: any): void {

    this.selectedValue = event.value;

    // Notify component consumer
    this.dropdownChanged.emit(this.selectedValue);

    // Notify Angular Forms
    this.onChange(this.selectedValue);

    // Mark as touched
    this.onTouched();
  }

  onDropdownShow(): void {
    this.dropdownIcon = 'pi pi-chevron-up';

    this.dropdownShown.emit();
  }

  onDropdownHide(): void {
    this.dropdownIcon = 'pi pi-chevron-down';

    this.dropdownHidden.emit();
  }

  // =========================================================
  // ControlValueAccessor
  // =========================================================

  writeValue(value: any): void {
    this.selectedValue = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled = isDisabled;
  }

  // =========================================================
  // Translation
  // =========================================================

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

    this.filterPlaceholderText =
      this.filterPlaceholder() ||
      this.translate.instant(
        'shared.dropdown.search'
      );
  }
}