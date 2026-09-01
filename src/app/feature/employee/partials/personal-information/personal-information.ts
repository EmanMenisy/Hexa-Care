// steps/personal-info/personal-info.ts
import { Component, effect, input, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { startWith } from 'rxjs';
import { InputTextComponent } from '../../../shared/components/primeng/input-text/input-text';
import { DropdownComponent } from '../../../shared/components/primeng/drop-down/drop-down';
import { CalenderComponent } from '../../../shared/components/primeng/date-picker/date-picker';
import { TranslatePipe } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { BloodType, EmployeeCreationMode } from '../../model/enums/employee-Creation-enums';
import { ButtonComponent } from "../../../shared/components/primeng/button/button";

@Component({
  selector: 'hexa-personal-info',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    SelectModule,
    DropdownComponent,
    InputTextComponent,
    CalenderComponent,
    ButtonComponent
],
  templateUrl: './personal-information.html',
  styleUrl: './personal-information.scss',
})
export class PersonalInfo {
  personalForm = input.required<FormGroup>();
  staffMode = input.required<EmployeeCreationMode>();
  readonly EmployeeCreationMode = EmployeeCreationMode;
  selectedPhotoName = signal<string>('');
  existingPhotoUrl = input<string | null>(null);
  photoPreviewUrl = signal<string | null>(null);
  photoError = signal<string | null>(null);
  age = signal<number | null>(null);
  today = new Date();
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

  bloodGroupOptions = [
  { label: 'A+', value: BloodType.A_Positive },
  { label: 'A-', value: BloodType.A_Negative },
  { label: 'B+', value: BloodType.B_Positive },
  { label: 'B-', value: BloodType.B_Negative },
  { label: 'AB+', value: BloodType.AB_Positive },
  { label: 'AB-', value: BloodType.AB_Negative },
  { label: 'O+', value: BloodType.O_Positive },
  { label: 'O-', value: BloodType.O_Negative },
 ];


  constructor() {
    effect((onCleanup) => {
      const dobControl = this.personalForm().get('dateOfBirth');
      if (!dobControl) return;

      const sub = dobControl.valueChanges
        .pipe(startWith(dobControl.value))
        .subscribe((value) => this.age.set(this.calculateAge(value)));

      onCleanup(() => sub.unsubscribe());
    });

    effect(() => {
    const existingUrl = this.existingPhotoUrl();

    if (existingUrl && !this.photoPreviewUrl()) {
      this.photoPreviewUrl.set(existingUrl);
    }
    });
  }

  private calculateAge(dob: string | null): number | null {
    if (!dob) return null;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null;

    const diffMs = Date.now() - birthDate.getTime();
    return Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
  }

  

  private readonly maxSizeMb = 2;
  private readonly allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];

  onUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!this.allowedTypes.includes(file.type)) {
      this.photoError.set('Only PNG, JPG or WEBP images are allowed.');
      input.value = '';
      this.selectedPhotoName.set('');
      return;
    }

    if (file.size > this.maxSizeMb * 1024 * 1024) {
      this.photoError.set(`Image must be smaller than ${this.maxSizeMb}MB.`);
      input.value = '';
      this.selectedPhotoName.set('');
      return;
    }

    this.photoError.set(null);
    this.selectedPhotoName.set(file.name);

    const reader = new FileReader();

    reader.onload = () => {
      this.photoPreviewUrl.set(reader.result as string);
    };

    reader.readAsDataURL(file);

    this.personalForm().get('Photo')?.setValue(file);
    this.personalForm().get('Photo')?.markAsTouched();
  }

  onRemove(input: HTMLInputElement): void {
    this.photoPreviewUrl.set(null);
    this.photoError.set(null);
    this.selectedPhotoName.set('');

    input.value = '';

    this.personalForm().get('Photo')?.setValue(null);
  }
}
