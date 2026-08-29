import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, NonNullableFormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { merge , startWith } from 'rxjs';
import { EmployeeCreationStepper } from '../employee-creation-stepper/employee-creation-stepper';
import { ButtonComponent } from '../../../shared/components/primeng/button/button';
import { PersonalInfo } from "../personal-information/personal-information";
import { ProfessionalInformation } from "../professional-information/professional-information";
import { EmployeeCreationMode } from '../../model/enums/employee-Creation-enums';
import { AssignationInformation } from '../assignation-information/assignation-information';

@Component({
  selector: 'hexa-employee-creation',
  imports: [EmployeeCreationStepper, ButtonComponent, PersonalInfo, ProfessionalInformation, AssignationInformation],
  templateUrl: './employee-creation.html',
  styleUrl: './employee-creation.scss',
})
export class EmployeeCreation implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  form = this.buildForm();

  employeeId = this.route.snapshot.paramMap.get('id');
  mode: 'create' | 'update' = this.employeeId ? 'update' : 'create';

  staffTypeId: string | null = null;
  staffMode = signal<EmployeeCreationMode>(Number(this.route.snapshot.queryParamMap.get('mode')) as EmployeeCreationMode
);

private buildForm() {
  return this.fb.group({
    personal: this.fb.group({
    firstName: ['', Validators.required],
    secondName: [''],
    thirdName: [''],
    lastName: ['', Validators.required],
    name: [''],
    nameArabic: [''],           // staffMember فقط
    gender: [1],
    dateOfBirth: [''],
    nationality: [''],
    nationalId: [''],           // staffMember فقط
    maritalStatus: [1],
    bloodGroup: [''],
    phone: [''],                // staffMember: phone / doctor: mobile — بنستخدم اسم واحد ونحوّله وقت الـ payload
    email: [''],
    address: [''],
    city: [''],
    governorate: [''],
    postalCode: [''],
    country: [''],
    emergencyContactName: [''], // staffMember فقط
    emergencyContactPhone: [''],// staffMember فقط
    username: ['', ],
    password: ['',],
    staffMemberTypeId: [''],    
    photoUrl: [''],
  }),

  professional: this.fb.group({
    // مشترك
    specialty: [''],
    qualification: [''],
    yearsOfExperience: [0],
    registrationNumber: [''],
    experienceSummary: [''],
    bio: [''],
    languages: [''],
    joiningDate: [''],
    commissionPercent: [0],

    // doctor فقط
    subSpecialty: [''],
    rank: [0],
    licenseNumber: [''],
    medicalCouncil: [''],
    academicRank: [''],
    areasOfExpertise: [''],
    isActive: [true],
    cashCommissionPercent: [0],
    contractCommissionPercent: [0],

    // staffMember فقط
    jobTitle: [''],
    employmentType: [1],
    contractEndDate: [''],
    baseSalary: [0],
    insuranceNumber: [''],
    licensingAuthority: [''],
    skills: [''],
    certifications: [''],
  }),
  assignment: this.fb.group({
  company: this.fb.control<string[]>([], this.requiredArray),
  branch: this.fb.control<string[]>([], this.requiredArray),
  department: this.fb.control<string[]>([], this.requiredArray),
  team: this.fb.control<string[]>([], this.requiredArray),
  roles: this.fb.array([this.createRole()]),
  }),  
  documents: this.fb.array<any>([]),
  });
}

private requiredArray(control: AbstractControl): ValidationErrors | null {
  return Array.isArray(control.value) && control.value.length > 0 ? null : { required: true };
}

private createRole(isMain = true) {
  return this.fb.group({
    isSystemRole: [null as boolean | null,],
    roleId: ['',],
    isMainRole: [isMain],
    mainHeadHierarchy: ['', ],
    headHierarchy: [[] as string[]], 
    
    // UI only
    roleOptions: [[] as any[]],        
    headOptions: [[] as any[]],       
    headValueField: [''],              
  });
}

  // private formTick = toSignal(
  //   merge(this.form.valueChanges, this.form.statusChanges),
  //   { initialValue: null }
  // );
private formTick = toSignal(
  merge(this.form.valueChanges, this.form.statusChanges).pipe(startWith(null)),
  { initialValue: null }
);
  steps = signal([
    { label: 'Personal info', subtitle: 'Personal details' },
    { label: 'Professional', subtitle: 'Experience & skills' },
    { label: 'Assignation', subtitle: 'Assignation structure' },
    { label: 'Documents', subtitle: 'Attachments' },
  ]);

  step = signal(1);
  private visitedStep = signal(1);

 firstInvalidCap(): number {
  for (let i = 0; i < this.steps().length; i++) {
    if (!this.isStepValid(i)) return i + 1;
  }
  return this.steps().length;
}

 maxStep(): number {
  if (this.mode === 'update') return this.steps().length;
  return Math.min(this.visitedStep(), this.firstInvalidCap());
}

 
canGoNext(): boolean {
  return this.mode === 'update' || this.isStepValid(this.step() - 1);
}

  get isLastStep(): boolean {
    return this.step() === this.steps().length;
  }

  isStepValid(i: number): boolean {
    const groups = [this.form.controls.personal, this.form.controls.professional, this.form.controls.assignment];
    return i < 3 ? groups[i].valid : true;
  }

  ngOnInit(): void {
      const routeStaffTypeId = this.route.snapshot.queryParamMap.get('staffTypeId');
      if (this.mode === 'create') {
        this.staffTypeId = routeStaffTypeId;
      }
    if (this.mode === 'update' && this.employeeId) {
      // employeeService.getById(this.employeeId).subscribe(emp => {
      //   this.form.patchValue({ personal: emp.personal, professional: emp.professional, assignment: emp.assignment });
      // });
    }
  }

  onCancel(): void {
    this.router.navigate(['/employees']);
  }

  onNext(): void {
    if (this.isLastStep || !this.canGoNext()) return;
    this.step.update((s) => s + 1);
    if (this.step() > this.visitedStep()) {
      this.visitedStep.set(this.step());
    }
  }

 

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.buildPayload();
    console.log(this.mode, this.staffMode(), payload);
    // employeeService.create/update(payload).subscribe(...)
  }

  private buildPayload() {
    const { personal, professional, assignment } = this.form.getRawValue();

    if (this.staffMode() === EmployeeCreationMode.Doctor) {
      return {
        personalInformation: personal,
        professionalInformation: professional,
        assigneionInformationViewModel: assignment,
      };
    }

    return {
      basicInfo: { ...personal, staffMemberTypeId: this.staffTypeId },
      employment: professional,
      assignation: assignment,
    };
  }
}