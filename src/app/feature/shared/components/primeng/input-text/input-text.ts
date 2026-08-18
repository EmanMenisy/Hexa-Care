import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, input, output } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { InputText } from 'primeng/inputtext';
@Component({
  selector: 'hexa-input-text',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule , InputText],
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
  value: string | undefined;
  disabled: boolean = false;

  readonly required = input(false);
  readonly readonly = input(false);
  readonly hidden = input(false);
  readonly maxlength = input<number | null>(null);
  readonly placeholder = input('');
  readonly hasError = input(false);
  readonly isSearchable = input(false);
  readonly canClear = input(false);
  readonly withoutBorder = input(false);
  readonly emitOnBlur = input(true);
  readonly inputId = input('');
  readonly inputName = input('');
  readonly autoComplete = input(true);
  readonly prefixIcon = input('');
  readonly suffixIcon = input('');
  readonly prefixText = input('');
  readonly suffixText = input('');
  readonly iconType = input<'icon' | 'image'>('icon');
  readonly type = input<'password' | 'email' | 'text'>('text');
  readonly prefixMethod = input<(action?: any) => void>(() => {});
  readonly suffixMethod = input<(action?: any) => void>(() => {});
  readonly suffixActionIndex = input<number>();
  readonly suffixIconClicked = output<number | undefined>();
  readonly inputTextChanged = output<string>();
  readonly enterPressed = output<void>();

  textChanged = new Subject<string>();

  constructor() {
    this.textChanged
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((value) => {
        this.inputTextChanged.emit(value);
      });
  }

  emitInputTextValue(value: any): void {
    const inputValue: string = typeof value === 'string' ? value.trim() : (value?.target?.value ?? '').trim();
    this.onChange(inputValue);
    this.onTouched(inputValue);
    this.inputTextChanged.emit(inputValue);

    if (!this.emitOnBlur()) {
      this.textChanged.next(inputValue);
    }
  }

  onBlur(): void {
    this.onChange(this.value);
    this.onTouched(this.value);

    if (this.emitOnBlur()) {
      this.textChanged.next(this.value ?? '');
    }
  }

  removeText(): void {
    this.value = '';
    this.textChanged.next(this.value);
    this.onChange(this.value);
    this.onTouched(this.value);
  }

  onChange = (value: any): any => value;
  onTouched = (value: any): any => value;

  writeValue(value: any): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSuffixIconClicked(): void {
    this.suffixIconClicked.emit(this.suffixActionIndex());
  }

  onEnter() {
    this.enterPressed.emit();
  }
}