import {
  Component,
  ContentChild,
  DestroyRef,
  TemplateRef,
  forwardRef,
  inject,
  input,
  model,
  output,
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
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
export class DropdownComponent implements ControlValueAccessor {

  // =========================================================
  // VALUE
  // =========================================================

  /**
   * Used when the dropdown is used without Reactive Forms.
   *
   * Example:
   *
   * [(selectedValue)]="selectedRoleId"
   *
   * or:
   *
   * [selectedValue]="selectedRoleId()"
   */
  readonly selectedValue = model<any>(null);

  // =========================================================
  // INPUTS
  // =========================================================

  readonly options = input<any[]>([]);

  readonly optionLabel = input('label');

  readonly optionValue = input('value');

  /**
   * Placeholder comes directly from the parent.
   *
   * Example:
   *
   * [placeholder]="'employee.personal_info.gender_placeholder' | translate"
   */
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
  // CONTROL VALUE ACCESSOR STATE
  // =========================================================

  /**
   * Disabled state coming from Angular Reactive Forms.
   */
  cvaDisabled = false;

  // =========================================================
  // TRANSLATIONS
  // =========================================================

  emptyMessageText = '';

  emptyFilterMessageText = '';

  filterPlaceholderText = '';

  // =========================================================
  // ICON
  // =========================================================

  dropdownIcon = 'pi pi-chevron-down';

  // =========================================================
  // TEMPLATES
  // =========================================================

  @ContentChild('optionTemplate')
  OptionTemplateOutlet?: TemplateRef<any>;

  @ContentChild('selectedTemplate')
  SelectedOptionTemplateOutlet?: TemplateRef<any>;

  // =========================================================
  // OUTPUTS
  // =========================================================

  /**
   * Emits whenever the user changes the dropdown value.
   */
  readonly dropdownChanged = output<any>();

  readonly dropdownShown = output<void>();

  readonly dropdownHidden = output<void>();

  readonly dropdownScrolled = output<string>();

  // =========================================================
  // CONTROL VALUE ACCESSOR
  // =========================================================

  private onChange: (value: any) => void = () => {};

  private onTouched: () => void = () => {};

  // =========================================================
  // SERVICES
  // =========================================================

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly translate: Localization
  ) {}

  // =========================================================
  // LIFECYCLE
  // =========================================================

  ngOnInit(): void {
    this.setTranslations();

    this.translate
      .onLangChange()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.setTranslations();
      });
  }

  // =========================================================
  // DROPDOWN CHANGE
  // =========================================================

  onDropdownChange(event: any): void {
    const value = event?.value;

    // Update model()
    this.selectedValue.set(value);

    // Notify Reactive Forms
    this.onChange(value);

    // Mark as touched
    this.onTouched();

    // Notify parent
    this.dropdownChanged.emit(value);
  }

  // =========================================================
  // DROPDOWN SHOW / HIDE
  // =========================================================

  onDropdownShow(): void {
    this.dropdownIcon = 'pi pi-chevron-up';

    this.dropdownShown.emit();
  }

  onDropdownHide(): void {
    this.dropdownIcon = 'pi pi-chevron-down';

    this.dropdownHidden.emit();
  }

  // =========================================================
  // CONTROL VALUE ACCESSOR
  // =========================================================

  /**
   * Called by Angular Forms when the value
   * changes from outside the component.
   */
  writeValue(value: any): void {
    this.selectedValue.set(value);
  }

  /**
   * Register Angular Forms change callback.
   */
  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  /**
   * Register Angular Forms touched callback.
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Called by Angular Forms when:
   *
   * formControl.disable()
   *
   * or:
   *
   * formControl.enable()
   */
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled = isDisabled;
  }

  // =========================================================
  // TRANSLATIONS
  // =========================================================

  setTranslations(): void {
    this.emptyMessageText =
      this.emptyMessage() ||
      this.translate.instant('shared.dropdown.noItems');

    this.emptyFilterMessageText =
      this.emptyFilterMessage() ||
      this.translate.instant('shared.dropdown.noItems');

    this.filterPlaceholderText =
      this.filterPlaceholder() ||
      this.translate.instant('shared.dropdown.search');
  }
}