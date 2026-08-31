// steps/personal-info/personal-info.ts
import { Component, effect, input, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { startWith } from 'rxjs';
import { InputTextComponent } from '../../../shared/components/primeng/input-text/input-text';
import { DropdownComponent } from '../../../shared/components/primeng/drop-down/drop-down';
import { CalenderComponent } from '../../../shared/components/primeng/date-picker/date-picker';
import { TranslatePipe } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { EmployeeCreationMode } from '../../model/enums/employee-Creation-enums';
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

  photoPreviewUrl = signal<string | null>(null);
  photoError = signal<string | null>(null);

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

    this.personalForm().get('photoUrl')?.setValue(file);
    this.personalForm().get('photoUrl')?.markAsTouched();
  }

  onRemove(input: HTMLInputElement): void {
    this.photoPreviewUrl.set(null);
    this.photoError.set(null);
    this.selectedPhotoName.set('');

    input.value = '';

    this.personalForm().get('photoUrl')?.setValue(null);
  }
}
