import { CommonModule } from '@angular/common';
import {
  Component,
  forwardRef,
  input,
  output,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { InputText } from 'primeng/inputtext';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';

@Component({
  selector: 'hexa-input-text',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    InputText,
    InputIcon,
    IconField,
  ],
  templateUrl: './input-text.html',
  styleUrls: ['./input-text.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputTextComponent),
      multi: true,
    },
  ],
})
export class InputTextComponent implements ControlValueAccessor {
  // ============================================================
  // VALUE
  // ============================================================
  /**
   * Internal value used by ControlValueAccessor.
   * When using formControlName, the FormControl controls this value.
   */
  value = '';
  /**
   * Value used when the component is used without a FormControl.
   */
  readonly valueInput = input<string | number | null>(null);

  // ============================================================
  // DISABLED
  // ============================================================


  /**
   * Disabled state coming from FormControl.
   */
  private formDisabled = false;

  get disabledState(): boolean {
    return this.formDisabled || this.disabled();
  }

  // ============================================================
  // INPUTS
  // ============================================================

  readonly required = input(false);
  readonly readonly = input(false);
  readonly hidden = input(false);
  readonly maxLength = input<number | null>(null);
  readonly placeholder = input('');
  readonly hasError = input(false);
  readonly isSearchable = input(false);
  readonly canClear = input(false);
  readonly withoutBorder = input(false);
  readonly emitOnBlur = input(true);
  readonly inputId = input('');
  readonly inputName = input('');
  readonly autoComplete = input(true);
  readonly disabled = input(false);

  readonly prefixIcon = input('');
  readonly suffixIcon = input('');
  readonly prefixText = input('');
  readonly suffixText = input('');

  readonly iconType = input<'icon' | 'image'>('icon');
  readonly type = input<'password' | 'email' | 'text'>('text');

  readonly prefixMethod = input<(action?: any) => void>(() => {});
  readonly suffixMethod = input<(action?: any) => void>(() => {});

  readonly suffixActionIndex = input<number>();

  // ============================================================
  // OUTPUTS
  // ============================================================

  readonly suffixIconClicked = output<number | undefined>();

  /**
   * Emits whenever the input value changes.
   *
   * Can be used when the component is NOT connected to a FormControl.
   */
  readonly inputTextChanged = output<string>();
  readonly enterPressed = output<void>();

  // ============================================================
  // DEBOUNCE
  // ============================================================

  textChanged = new Subject<string>();

  constructor() {
    this.textChanged
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        this.inputTextChanged.emit(value);
      });
  }

  // ============================================================
  // DISPLAY VALUE
  // ============================================================

  /**
   * Value displayed inside the input.
   *
   * If the component has a FormControl, the FormControl value
   * is used.
   *
   * Otherwise, valueInput is used.
   */
  get displayValue(): string {
    if (this.value !== '') {
      return this.value;
    }

    return String(this.valueInput() ?? '');
  }

  // ============================================================
  // INPUT EVENT
  // ============================================================

  emitInputTextValue(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    const inputValue = inputElement.value.trim();

    this.value = inputValue;

    // Notify ControlValueAccessor
    this.onChange(inputValue);
    this.onTouched(inputValue);

    // Notify parent
    this.inputTextChanged.emit(inputValue);

    // Debounce
    if (!this.emitOnBlur()) {
      this.textChanged.next(inputValue);
    }
  }

  // ============================================================
  // BLUR
  // ============================================================

  onBlur(): void {
    this.onChange(this.value);
    this.onTouched(this.value);

    if (this.emitOnBlur()) {
      this.textChanged.next(this.value);
    }
  }

  // ============================================================
  // CLEAR
  // ============================================================

  removeText(): void {
    this.value = '';

    this.textChanged.next(this.value);

    this.onChange(this.value);
    this.onTouched(this.value);

    this.inputTextChanged.emit(this.value);
  }

  // ============================================================
  // CONTROL VALUE ACCESSOR
  // ============================================================

  onChange = (_value: string) => {};

  onTouched = (_value: string) => {};

  writeValue(value: any): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled = disabled;
  }

  // ============================================================
  // SUFFIX
  // ============================================================

  onSuffixIconClicked(): void {
    this.suffixIconClicked.emit(this.suffixActionIndex());
  }

  // ============================================================
  // ENTER
  // ============================================================

  onEnter(): void {
    this.enterPressed.emit();
  }
}