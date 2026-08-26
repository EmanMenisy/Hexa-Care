import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  DestroyRef,
  OnInit,
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
export class DropdownComponent
  implements ControlValueAccessor, OnInit, AfterViewInit {

  // =========================================================
  // VALUE
  // =========================================================

  /**
   * Used when the dropdown is consumed outside Reactive Forms.
   *
   * Supports:
   *
   * [(selectedValue)]="selectedRoleId"
   *
   * or:
   *
   * [selectedValue]="selectedRoleId()"
   *
   * The model() allows the child to update the parent's value
   * ONLY when the parent binds it with [(selectedValue)].
   * With one-way [selectedValue], the child updates its own
   * copy only, and (dropdownChanged) stays the parent's
   * independent notification channel.
   */
  readonly selectedValue = model<any>(null);

  // =========================================================
  // INPUTS
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
  // CONTROL VALUE ACCESSOR STATE
  // =========================================================

  /**
   * Disabled state coming from Angular Forms.
   *
   * Example:
   *
   * formControl.disable()
   */
  cvaDisabled = false;

  // =========================================================
  // TRANSLATIONS
  // =========================================================

  placeholderText = '';

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
   * Emits when the user changes the dropdown value.
   *
   * Useful for:
   *
   * - API calls
   * - loading dependent dropdowns
   * - resetting other fields
   * - any custom business logic
   *
   * Example:
   *
   * (dropdownChanged)="onRoleChange($event)"
   */
  readonly dropdownChanged = output<any>();

  readonly dropdownShown = output<void>();

  readonly dropdownHidden = output<void>();

  readonly dropdownScrolled = output<string>();

  // =========================================================
  // CONTROL VALUE ACCESSOR
  // =========================================================

  /**
   * Angular Forms calls this function when
   * the user changes the value.
   */
  private onChange: (value: any) => void = () => {};

  /**
   * Angular Forms calls this when the control is touched.
   */
  private onTouched: () => void = () => {};

  /**
   * Used to auto-unsubscribe from the langChange
   * subscription when the component is destroyed.
   */
  private readonly destroyRef = inject(DestroyRef);

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly translate: Localization
  ) {}

  // =========================================================
  // LIFECYCLE
  // =========================================================

  ngOnInit(): void {
    this.setTranslations();

    this.translate.onLangChange()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.setTranslations();
      });
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  // =========================================================
  // DROPDOWN CHANGE
  // =========================================================

  /**
   * Called only when the PrimeNG dropdown value changes
   * through user interaction.
   *
   * This method supports ALL usage scenarios:
   *
   * 1. Outside Reactive Forms
   * 2. Inside Reactive Forms
   * 3. Outside Forms + custom change event
   * 4. Inside Forms + custom change event
   */
  onDropdownChange(event: any): void {
    const value = event?.value;

    // -------------------------------------------------------
    // 1. Update model()
    // -------------------------------------------------------
    //
    // This supports:
    //
    // [(selectedValue)]="selectedRoleId"
    //
    this.selectedValue.set(value);

    // -------------------------------------------------------
    // 2. Notify Angular Reactive Forms
    // -------------------------------------------------------
    //
    // This supports:
    //
    // formControlName="parentRoleId"
    //
    this.onChange(value);

    // -------------------------------------------------------
    // 3. Mark control as touched
    // -------------------------------------------------------
    this.onTouched();

    // -------------------------------------------------------
    // 4. Notify Parent about USER CHANGE
    // -------------------------------------------------------
    //
    // This supports:
    //
    // (dropdownChanged)="onRoleChange($event)"
    //
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
   * Called by Angular Forms when the FormControl value changes
   * from outside the component.
   *
   * Examples:
   *
   * formControl.setValue(5)
   *
   * formControl.patchValue(5)
   *
   * form.reset()
   */
  writeValue(value: any): void {
    this.selectedValue.set(value);
  }

  /**
   * Angular Forms gives us a callback that must be called
   * whenever the user changes the value.
   */
  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  /**
   * Angular Forms gives us a callback that must be called
   * when the control becomes touched.
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