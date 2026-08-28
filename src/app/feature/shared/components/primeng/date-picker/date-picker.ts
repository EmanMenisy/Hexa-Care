import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef, Component, effect, ElementRef, forwardRef, input, model, output, viewChild
} from '@angular/core';
import {
  ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR
} from '@angular/forms';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { CalendarType } from '../../../../../core/models/enums/calender/calendar-type';
import { TimeFormat } from '../../../../../core/models/enums/calender/time-format';
import { DateFormat } from '../../../../../core/models/enums/calender/date-format';
import { DateSelectionMode } from '../../../../../core/models/enums/calender/date-selection-mode';
import { DateTimeType } from '../../../../../core/models/enums/calender/date-time-type';


@Component({
  selector: 'hexa-calender',
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
export class CalenderComponent implements ControlValueAccessor {
  // Inputs (read-only من برا)
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

  // دول model() مش input() عادي، لأن الـ CVA (writeValue/setDisabledState) بيكتب فيهم من جوه
  value = model<Date | undefined>(undefined);
  values = model<Date[] | undefined>(undefined);
  disabled = model<boolean>(false);

  // Outputs
  calendarChanged = output<Date[]>();
  closeCalender = output<void>();

  pCalendar = viewChild<DatePicker>('pCalendar');

  pDateSelectionMode = model<'single' | 'multiple' | 'range'>('single');
  pDateFormat = model<string>('dd/mm/yy');

  // enums
  dateTimeType = DateTimeType;
  TimeFormat = TimeFormat;
  CalendarType = CalendarType;

  private initializedFromValues = false;

  constructor(private elRef: ElementRef, private cd: ChangeDetectorRef) {
    // بديل ngOnInit: تهيئة value من values[0] لو single mode - مرة واحدة بس
    effect(() => {
      const vs = this.values();
      if (!this.initializedFromValues) {
        this.initializedFromValues = true;
        if (vs && vs.length) {
          if (this.dateSelectionMode() === DateSelectionMode.SingleDate) {
            this.value.set(new Date(vs[0]));
          } else {
            this.values.set(vs.map((date) => new Date(date)));
          }
        } else {
          this.values.set(undefined);
        }
      }
    });

    // بديل: changes['dateSelectionMode']
    effect(() => this.getDateSelectionMode());

    // بديل: changes['dateFormat']
    effect(() => this.getDateFormat());

    // بديل: تحديث input field لما timeFormat أو dateFormat يتغيروا
    effect(() => {
      this.timeFormat();
      this.dateFormat();
      const cal = this.pCalendar();
      if (cal) {
        requestAnimationFrame(() => cal.updateInputfield());
      }
    });

    // بديل: changes['disabled'] -> force update
    effect(() => {
      this.disabled();
      this.cd.detectChanges();
    });

    // بديل: تحويل value الجاي من برا (لو مش Date) لـ Date حقيقي
    effect(() => {
      const v = this.value();
      if (v && !(v instanceof Date)) {
        this.value.set(new Date(v));
      }
    });

    // نفس الحكاية لـ values (لو اتغيرت من برا بعد التهيئة الأولى)
    effect(() => {
      const vs = this.values();
      if (vs?.length && vs.some((d) => !(d instanceof Date))) {
        this.values.set(vs.map((d) => new Date(d)));
      }
    });
  }

  onSingleChange(newValue: Date | null): void {
    this.value.set(newValue ?? undefined);

    if (this.value()) {
      if (this.timeOnly()) {
        this.validateTime();
      } else {
        this.calendarChanged.emit([this.value()!]);
        this.onChange(this.value());
        this.onTouched(this.value());
      }
    } else {
      this.calendarChanged.emit([]);
      this.onChange('');
      this.onTouched('');
    }
  }

  onMultiChange(value: Date[]): void {
    this.values.set(value);

    if (value && value.length) {
      if (
        this.dateSelectionMode() === DateSelectionMode.DateRange &&
        value.length === 2
      ) {
        if (value[1]) this.calendarChanged.emit(value);
        else this.calendarChanged.emit([value[0]]);
      } else this.calendarChanged.emit(value);
    } else {
      this.values.set(undefined);
      this.calendarChanged.emit([]);
      this.onChange('');
      this.onTouched('');
    }
  }

  validateTime(): void {
    const current = this.value();
    if (!this.validateMinTime(current!, this.minDate())) {
      current?.setHours(this.minDate()!.getHours(), this.minDate()!.getMinutes());
    }
    if (!this.validateMaxTime(current!, this.maxDate())) {
      current?.setHours(this.maxDate()!.getHours(), this.maxDate()!.getMinutes());
    }
    if (current) {
      current.setSeconds(0);
      this.value.set(current);
      this.calendarChanged.emit([current]);
      this.onChange(current);
      this.onTouched(current);
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
        this.pDateSelectionMode.set('single');
        break;
      case DateSelectionMode.MultipleDates:
        this.pDateSelectionMode.set('multiple');
        break;
      case DateSelectionMode.DateRange:
        this.pDateSelectionMode.set('range');
        break;
      default:
        break;
    }
  }

  getDateFormat(): void {
    switch (this.dateFormat()) {
      case DateFormat.DMY:
        this.pDateFormat.set('dd/mm/yy');
        break;
      case DateFormat.MDY:
        this.pDateFormat.set('mm/dd/yy');
        break;
      case DateFormat.YMD:
        this.pDateFormat.set('yy/mm/dd');
        break;
      default:
        break;
    }
  }

  onChange = (value: any): any => value;
  onTouched = (value: any): any => value;

  writeValue(object: any): void {
    if (object) {
      if (this.dateSelectionMode() === DateSelectionMode.SingleDate) {
        this.value.set(new Date(object));
      } else {
        this.values.set(object.map((ele: Date) => new Date(ele)));
      }
    } else {
      if (this.dateSelectionMode() === DateSelectionMode.SingleDate) {
        this.value.set(undefined);
      } else {
        this.values.set(undefined);
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  isDisabledMonth(month: number): boolean {
    return this.disabledMonths()
      ? this.disabledMonths().includes(month + 1)
      : false;
  }

  private parseDate(date: Date | string): Date {
    const d = new Date(date);
    if (!this.timeOnly() && !this.showTime()) {
      d.setHours(0, 0, 0, 0);
    }
    return d;
  }
}