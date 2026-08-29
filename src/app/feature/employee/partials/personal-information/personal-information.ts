// steps/personal-info/personal-info.ts
import { Component, effect, input, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { startWith } from 'rxjs';
import { InputTextComponent } from "../../../shared/components/primeng/input-text/input-text";
import { DropdownComponent } from '../../../shared/components/primeng/drop-down/drop-down';
import { CalenderComponent } from '../../../shared/components/primeng/date-picker/date-picker';
import { TranslatePipe } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { EmployeeCreationMode } from '../../model/enums/employee-Creation-enums';

@Component({
  selector: 'hexa-personal-info',
  standalone: true,
  imports: [ReactiveFormsModule,TranslatePipe,SelectModule, DropdownComponent, InputTextComponent , CalenderComponent],
  templateUrl: './personal-information.html',
  styleUrl: './personal-information.scss',
})
export class PersonalInfo {
  personalForm = input.required<FormGroup>();
  staffMode = input.required<EmployeeCreationMode>();
  readonly EmployeeCreationMode = EmployeeCreationMode;

  genderOptions = [
    { label: 'Male', value: 1 },
    { label: 'Female', value: 2 },
  ];

  maritalStatusOptions = [
    { label: 'Single', value: 1 },
    { label: 'Married', value: 2 },
    { label: 'Divorced', value: 3 },
    { label: 'Widowed', value: 4 },
  ];

  bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((v) => ({
    label: v,
    value: v,
  }));

  age = signal<number | null>(null);

  constructor() {
    effect((onCleanup) => {
      const dobControl = this.personalForm().get('dateOfBirth');
      if (!dobControl) return;

      const sub = dobControl.valueChanges
        .pipe(startWith(dobControl.value))
        .subscribe((value) => this.age.set(this.calculateAge(value)));

      onCleanup(() => sub.unsubscribe());
    });
  }

  private calculateAge(dob: string | null): number | null {
    if (!dob) return null;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null;

    const diffMs = Date.now() - birthDate.getTime();
    return Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
  }
}