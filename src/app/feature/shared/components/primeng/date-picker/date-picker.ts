import { CommonModule } from '@angular/common';
import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input,
  OnChanges, OnInit, SimpleChanges, forwardRef, inject, input, output, viewChild
} from '@angular/core';
import {
  ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR
} from '@angular/forms';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { CalendarType } from '../../../../../core/models/enums/calender/calendar-type';
import { DateSelectionMode } from '../../../../../core/models/enums/calender/date-selection-mode';
import { DateFormat } from '../../../../../core/models/enums/calender/date-format';
import { TimeFormat } from '../../../../../core/models/enums/calender/time-format';
import { DateTimeType } from '../../../../../core/models/enums/calender/date-time-type';


@Component({
  selector: 'opus-calender',
  standalone: true,
  imports: [CommonModule, DatePickerModule, FormsModule],
  templateUrl: './date-picker.html',
  styleUrls: ['./date-picker.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CalenderComponent),
      multi: true,
    },
  ],
})
export class CalenderComponent
  implements OnInit, OnChanges, AfterViewInit, ControlValueAccessor
{
  private elRef = inject(ElementRef);
  private cd = inject(ChangeDetectorRef);

  // ---- value/values/disabled: بتتعدل جوه الكومبوننت (writeValue, setDisabledState)
  // وبتتربط بـ [(ngModel)] جوه التمبلت => تفضل decorators عادية زي الأصل ----
  @Input() value?: Date;
  @Input() values?: Date[];
  @Input() disabled: boolean = false;

  // ---- باقي الـ Inputs: pure read-only من بره => signals ----
  defaultDate = input<Date | undefined>(undefined);
  placeholder = input<string>('00-00-0000');
  timeOnly = input<boolean>(false);
  calendarType = input<CalendarType>(CalendarType.Gregorian);
  timeFormat = input<TimeFormat>(TimeFormat.FullDay);
  dateFormat = input<DateFormat>(DateFormat.DMY);
  dateSelectionMode = input<DateSelectionMode>(DateSelectionMode.SingleDate);
  firstDayOfWeek = input<number>(0);
  disabledDates = input<Date[]>([]);
  disabledDays = input<number[]>([]);
  disabledMonths = input<number[]>([]);
  minDate = input<Date | undefined>(undefined);
  maxDate = input<Date | undefined>(undefined);
  showTime = input<boolean>(false);
  showButtonBar = input<boolean>(false);
  hasError = input<boolean>(false);
  readonly = input<boolean>(true);

  // ---- Outputs ----
  calendarChanged = output<Date[]>();
  closeCalender = output<void>();

  // ---- ViewChild كـ signal ----
  pCalendar = viewChild<DatePicker>('pCalendar');

  pDateSelectionMode: 'single' | 'multiple' | 'range' = 'single';
  pDateFormat: string = 'dd/mm/yy';
  dFBElement!: HTMLElement;

  //enums
  dateTimeType = DateTimeType;
  TimeFormat = TimeFormat;
  CalendarType = CalendarType;

  ngOnInit(): void {
    if (this.values && this.values.length) {
      if (this.dateSelectionMode() === DateSelectionMode.SingleDate) {
        this.value = new Date(this.values[0]);
      } else this.values = this.values.map((date) => new Date(date));
    } else delete this.values;

    // تهيئة أولى بناءً على الـ inputs الابتدائية
    this.getDateSelectionMode();
    this.getDateFormat();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cal = this.pCalendar();
    if (cal && (changes['timeFormat'] || changes['dateFormat'])) {
      requestAnimationFrame(() => cal.updateInputfield());
    }

    if (changes['dateSelectionMode']) this.getDateSelectionMode();
    if (changes['dateFormat']) this.getDateFormat();

    // 🟢 Force update when disabled changes
    if (changes['disabled']) {
      this.cd.detectChanges();
    }

    if (changes['values']) {
      if (changes['values'].currentValue?.length) {
        this.values = changes['values'].currentValue.map(
          (date: Date) => new Date(date)
        );
      } else delete this.values;
    }

    if (changes['value']?.currentValue) {
      this.value = new Date(changes['value'].currentValue);
    }
  }

  ngAfterViewInit(): void {}

  onSingleChange(): void {
    if (this.value) {
      // revisit
      if (this.timeOnly()) {
        this.validateTime();
      } else {
        this.calendarChanged.emit([this.value]);
        this.onChange(this.value);
        this.onTouched(this.value);
      }
    } else {
      //  null data cleared from input
      this.calendarChanged.emit([]);
      this.onChange('');
      this.onTouched('');
    }
  }

  onMultiChange(value: Date[]): void {
    if (value && value.length) {
      // Multiple
      // on select => value is [] of selected dates even on unselect
      // Range
      // on first select => value is [] of 2 , first selected , second null
      // on second select => value is [] of 2 , first selected , second selected
      if (
        this.dateSelectionMode() === DateSelectionMode.DateRange &&
        value.length === 2
      ) {
        if (value[1]) this.calendarChanged.emit(value);
        else this.calendarChanged.emit([value[0]]);
      } else this.calendarChanged.emit(value);
    }
    //  null data cleared from input
    else {
      delete this.values;
      this.calendarChanged.emit([]);
      this.onChange('');
      this.onTouched('');
    }
  }

  validateTime(): void {
    // validate time before emitting , as primeng doesn't validate time written in input
    const minDate = this.minDate();
    const maxDate = this.maxDate();

    if (!this.validateMinTime(this.value!, minDate))
      this.value?.setHours(minDate!.getHours(), minDate!.getMinutes());
    if (!this.validateMaxTime(this.value!, maxDate))
      this.value?.setHours(maxDate!.getHours(), maxDate!.getMinutes());
    if (this.value) {
      this.value.setSeconds(0);
      this.calendarChanged.emit([this.value]);
      this.onChange(this.value);
      this.onTouched(this.value);
    }
  }

  private validateMinTime(value: Date, minDate: Date | undefined): boolean {
    if (!minDate) return true;
    return value.getTime() >= minDate.getTime();
  }

  private validateMaxTime(value: Date, maxDate: Date | undefined): boolean {
    if (!maxDate) return true;
    return value.getTime() <= maxDate.getTime();
  }

  getDateSelectionMode(): void {
    switch (this.dateSelectionMode()) {
      case DateSelectionMode.SingleDate:
        this.pDateSelectionMode = 'single';
        break;
      case DateSelectionMode.MultipleDates:
        this.pDateSelectionMode = 'multiple';
        break;
      case DateSelectionMode.DateRange:
        this.pDateSelectionMode = 'range';
        break;
      default:
        break;
    }
  }

  getDateFormat(): void {
    switch (this.dateFormat()) {
      case DateFormat.DMY:
        this.pDateFormat = 'dd/mm/yy';
        break;
      case DateFormat.MDY:
        this.pDateFormat = 'mm/dd/yy';
        break;
      case DateFormat.YMD:
        this.pDateFormat = 'yy/mm/dd';
        break;
      default:
        break;
    }
  }

  onChange = (value: any): any => value;
  onTouched = (value: any): any => value;

  /**
   * this simple function created for writing a value into input text
   * @param object, value
   * @returns set the value with the written value
   */
  writeValue(object: any): void {
    if (object) {
      if (this.dateSelectionMode() === DateSelectionMode.SingleDate) {
        this.value = new Date(object);
      } else {
        this.values = object.map((ele: Date) => new Date(ele));
      }
    } else {
      if (this.dateSelectionMode() === DateSelectionMode.SingleDate) {
        this.value = undefined;
      } else {
        this.values = undefined;
      }
    }
  }

  /**
   * this simple function created for updating the value of the model
   * @param fn callback used to report the value back to the parent form
   * @returns function that the control value has changed
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * this simple function created for marking when the element has been touched
   * @param fn callback used to report the control that control is touched
   * @returns function that the control has touched
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  isDisabledMonth(month: number): boolean {
    const months = this.disabledMonths();
    return months ? months.includes(month + 1) : false;
  }

  private parseDate(date: Date | string): Date {
    const d = new Date(date);
    if (!this.timeOnly() && !this.showTime()) {
      d.setHours(0, 0, 0, 0);
    }
    return d;
  }
}