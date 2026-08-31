import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputTextComponent } from "../../../shared/components/primeng/input-text/input-text";
import { DropdownComponent } from "../../../shared/components/primeng/drop-down/drop-down";
import { TranslatePipe } from '@ngx-translate/core';
import { CalenderComponent } from "../../../shared/components/primeng/date-picker/date-picker";
import { TextareaModule } from 'primeng/textarea';
import { EmployeeCreationMode, EmploymentType } from '../../model/enums/employee-Creation-enums';
import { InputNumber } from "../../../shared/components/primeng/input-number/input-number";
@Component({
  selector: 'hexa-professional-information',
  imports: [InputTextComponent, DropdownComponent, TranslatePipe, CalenderComponent, ReactiveFormsModule, TextareaModule, InputNumber],
  templateUrl: './professional-information.html',
  styleUrl: './professional-information.scss',
})
export class ProfessionalInformation {
 professionalForm = input.required<FormGroup>();
 staffMode = input.required<EmployeeCreationMode>();
 readonly EmployeeCreationMode = EmployeeCreationMode;

  rankOptions = [
    { label: 'Unspecified', value: 0 },
    { label: 'Consultant', value: 1 },
    { label: 'Specialist', value: 2 },
    { label: 'Registrar', value: 3 },
    { label: 'Resident', value: 4 },
  ];

  employmentTypeOptions = [
  { label: 'Full Time', value: EmploymentType.FullTime },
  { label: 'Part Time', value: EmploymentType.PartTime },
  { label: 'Contract', value: EmploymentType.Contract },
  { label: 'Locum', value: EmploymentType.Locum },
  { label: 'Intern', value: EmploymentType.Intern },
];
}
