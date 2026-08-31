import {
  AfterViewChecked,
  Component,
  forwardRef,
  input,
  model,
  output,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
@Component({
  selector: 'hexa-input-number',
  imports: [InputNumberModule, FormsModule],
  templateUrl: './input-number.html',
  styleUrl: './input-number.scss',
   providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputNumber),
      multi: true,
    },
  ],
})
export class InputNumber {
  selectedValue = model<number | undefined>(undefined);

  showButtons = input<boolean>(false);
  minimum = input<number | undefined>(undefined);
  maximum = input<number | undefined>(undefined);
  disabled = input<boolean>(false);
  placeholder = input<string>('');
  maxlength = input<number | undefined>(undefined);
  maxFractionDigits = input<number>(0);
  emitOnBlur = input<boolean>(true);
  thousandsSeparator = input<boolean>(true);

  // سيبتها زي ما هي كـ output منفصل لأنها كانت مستخدمة بره سياق الـ CVA أصلاً (نفس القيمة اللي بيتبعتها selectedValue.emit ضمنيًا عبر model، فهي دلوقتي redundant لكن سايباها للتوافق مع أي حد لسه مستخدم (inputNumberChanged) في مكان تاني)
  inputNumberChanged = output<number | undefined>();

  ngAfterViewChecked(): void {
    const buttons = Array.prototype.filter.call(
      document.getElementsByClassName('p-inputnumber-button'),
      (ele) => ele.nodeName === 'BUTTON'
    );
    if (buttons?.length) {
      buttons.forEach((ele) => ele.setAttribute('tabindex', '-1'));
    }
  }

  onInput(event: any): void {
    const value = event.target?.value ? +event.target.value : event.value;
    if (!this.emitOnBlur()) {
      this.emitValue(value);
    }
  }

  onBlur(): void {
    let value = this.selectedValue();

    if (value != null && this.minimum() != null && value < this.minimum()!) {
      value = this.minimum();
      this.selectedValue.set(value);
    }
    if (value != null && this.maximum() != null && value > this.maximum()!) {
      value = this.maximum();
      this.selectedValue.set(value);
    }

    if (this.emitOnBlur()) {
      this.emitValue(value);
    }
  }

  emitValue(value?: number): void {
    if (value?.toString() === '-') {
      value = undefined;
    }
    this.selectedValue.set(value);
    this.inputNumberChanged.emit(value);
    this.onChange(value);
    this.onTouched(value);
  }

  onChange = (value: any): any => value;
  onTouched = (value: any): any => value;

  writeValue(value: any): void {
    this.selectedValue.set(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

}
