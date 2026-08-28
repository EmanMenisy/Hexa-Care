import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { EmployeeCreationStepper } from '../employee-creation-stepper/employee-creation-stepper';
import { ButtonComponent } from '../../../shared/components/primeng/button/button';
import { PersonalInfo } from "../personal-information/personal-information";

@Component({
  selector: 'hexa-employee-creation',
  imports: [EmployeeCreationStepper, ButtonComponent, PersonalInfo],
  templateUrl: './employee-creation.html',
  styleUrl: './employee-creation.scss',
})
export class EmployeeCreation implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  employeeId = this.route.snapshot.paramMap.get('id');
  mode: 'create' | 'update' = this.employeeId ? 'update' : 'create';

  form = this.fb.group({
    personal: this.fb.group({
      firstName: ['', Validators.required],
      secondName: [''],
      thirdName: [''],
      lastName: ['', Validators.required],
      nameEnglish: [''],
      gender: [''],
      dateOfBirth: [''],
      nationality: [''],
      nationalId: [''],
      maritalStatus: [1],
      bloodGroup: [''],
      phone: [''],
      email: [''],
      address: [''],
      city: [''],
      governorate: [''],
      postalCode: [''],
      country: [''],
      emergencyContactName: [''],
      emergencyContactPhone: [''],
    }),
    professional: this.fb.group({}),
    assignment: this.fb.group({}),
    documents: this.fb.array<any>([]),
  });

  steps = signal([
    { label: 'Personal info', subtitle: 'Personal details' },
    { label: 'Professional', subtitle: 'Experience & skills' },
    { label: 'Assignation', subtitle: 'Assignation structure' },
    { label: 'Documents', subtitle: 'Attachments' },
  ]);

  step = signal(1);

  completedSteps = computed(() => [
    this.form.controls.personal.valid,
    this.form.controls.professional.valid,
    this.form.controls.assignment.valid,
    true,
  ]);

  get isLastStep(): boolean {
    return this.step() === this.steps().length;
  }

  ngOnInit(): void {
    if (this.mode === 'update' && this.employeeId) {
      // employeeService.getById(this.employeeId).subscribe(emp => {
      //   this.form.patchValue({
      //     personal: emp.personal,
      //     professional: emp.professional,
      //     assignment: emp.assignment,
      //   });
      // });
    }
  }

  onCancel(): void {
    this.router.navigate(['/employees']);
  }

  onNext(): void {
    if (this.isLastStep) return;
    this.step.update((s) => s + 1);
    console.log(this.form.getRawValue());
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.form.getRawValue();
    console.log(this.mode, payload);
    // employeeService.create/update(payload).subscribe(...)
  }
}