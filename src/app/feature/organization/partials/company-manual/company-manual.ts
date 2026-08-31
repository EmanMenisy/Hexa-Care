import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  Signal,
  computed,
  output,
  signal
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { InputTextComponent } from '../../../shared/components/primeng/input-text/input-text';
import { ButtonComponent } from '../../../shared/components/primeng/button/button';
import { TranslatePipe } from '@ngx-translate/core';
import { Organization } from '../../services/organization';
import { OrganizationLogic } from '../../services/organization-logic';
import { ToastService } from '../../../../core/services/toast/toast';
import { Localization } from '../../../../core/services/localization/localization';
import { ToastType } from '../../../../core/models/enums/toast-type';
import { HierarchySteps } from '../../models/organization-creation.model';
import { StepperComponent } from '../../../shared/components/common/stepper/stepper';

/* -------------------- internal wizard steps -------------------- */
// Each entry lists the companyForm control names that belong to that step,
// used to validate/touch only the relevant controls when moving forward.
const STEP_FIELDS: string[][] = [
  ['name', 'nameArabic', 'code', 'description', 'descriptionArabic'],
  ['country', 'state', 'city', 'address', 'phone', 'email', 'website'],
  [
    'commercialRegisterNo',
    'taxNumber',
    'licenseNumber',
    'managerName',
    'managerPhone',
    'managerEmail',
    'medicalDirector',
    'medicalDirectorPhone',
    'medicalDirectorEmail'
  ]
];

@Component({
  selector: 'app-company-manual',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextComponent,
    ButtonComponent,
    TranslatePipe,
    StepperComponent
  ],
  templateUrl: './company-manual.html',
  styleUrl: './company-manual.scss',
})
export class CompanyManual implements OnInit {
  companyForm: FormGroup;
  private readonly formStatus: Signal<string>;
  disabledForm: Signal<boolean>;

  constructor(
    private readonly organizationService:Organization,
    private readonly organizationLogicService:OrganizationLogic,
    private readonly toastService:ToastService,
    private readonly localizationService:Localization,
    private readonly destroyRef:DestroyRef,
    private readonly fb:FormBuilder
  ){
    this.companyForm = this.fb.group({
      name: ['', [Validators.required]],
      nameArabic: [''],
      code: [''],
      country: ['', [Validators.required]],
      state: ['', [Validators.required]],
      city: ['', [Validators.required]],
      address: [''],
      commercialRegisterNo: [''],
      taxNumber: [''],
      licenseNumber: [''],
      description: [''],
      descriptionArabic: [''],
      phone: [''],
      email: ['', [Validators.email]],
      website: [''],
      logoUrl: [''],
      managerName: [''],
      managerPhone: [''],
      managerEmail: ['', [Validators.email]],
      medicalDirector: [''],
      medicalDirectorPhone: [''],
      medicalDirectorEmail: ['', [Validators.email]]
    });

    this.formStatus = toSignal(this.companyForm.statusChanges, {
      initialValue: this.companyForm.status
    });
    this.disabledForm = computed(() => this.formStatus() !== 'VALID');
  }
  /* -------------------- outputs -------------------- */
  next = output<any>();
  save = output<boolean>();
  update = output<boolean>();

  /* -------------------- state (signals) -------------------- */
  id = signal<string | null>(null);
  isFirstStep = signal<boolean>(false);

  /* -------------------- internal wizard (stepper) -------------------- */
  totalSteps = STEP_FIELDS.length;
  currentStep = signal<number>(1);
  completedSteps = signal<boolean[]>(new Array(this.totalSteps).fill(false));
  stepperSteps = [
    { label: 'organization.company.steps.mainInformation' },
    { label: 'organization.company.steps.contactAndLocation' },
    { label: 'organization.company.steps.legalAndManagement' }
  ];
  isLastStep = computed(() => this.currentStep() === this.totalSteps);

  ngOnInit(): void {
    this.organizationLogicService.id$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => {
        if (id) {
          this.id.set(id);
          this.getCompanyById(id);
        }
      });

    this.organizationLogicService.start$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((start) => {
        this.isFirstStep.set(start === HierarchySteps.Company);
      });
  }

  getCompanyById(id: string) {
    this.organizationService.getCompanyById(id).subscribe((res: any) => {
      this.patchForm(res);
    });
  }

  // fills the form from the record returned by Organization.getCompanyById
  private patchForm(record: any): void {
    this.companyForm.patchValue({
      name: record.name,
      nameArabic: record.nameArabic,
      code: record.code,
      country: record.country,
      state: record.state,
      city: record.city,
      address: record.address,
      commercialRegisterNo: record.commercialRegisterNo,
      taxNumber: record.taxNumber,
      licenseNumber: record.licenseNumber,
      description: record.description,
      descriptionArabic: record.descriptionArabic,
      phone: record.phone,
      email: record.email,
      website: record.website,
      logoUrl: record.logoUrl,
      managerName: record.managerName,
      managerPhone: record.managerPhone,
      managerEmail: record.managerEmail,
      medicalDirector: record.medicalDirector,
      medicalDirectorPhone: record.medicalDirectorPhone,
      medicalDirectorEmail: record.medicalDirectorEmail
    } as any);
  }

  /* -------------------- wizard navigation -------------------- */
  onStepChange(step: number): void {
    // allow free navigation only across already-completed steps (or back)
    if (step <= this.currentStep() || this.completedSteps()[step - 2]) {
      this.currentStep.set(step);
    }
  }

  goBack(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  private isStepValid(step: number): boolean {
    const fields = STEP_FIELDS[step - 1] ?? [];
    return fields.every((field) => this.companyForm.get(field)?.valid ?? true);
  }

  private touchStep(step: number): void {
    const fields = STEP_FIELDS[step - 1] ?? [];
    fields.forEach((field) => this.companyForm.get(field)?.markAsTouched());
  }

  onPrimaryAction(): void {
    if (!this.isLastStep()) {
      if (!this.isStepValid(this.currentStep())) {
        this.touchStep(this.currentStep());
        return;
      }
      this.completedSteps.update((steps) => {
        const copy = [...steps];
        copy[this.currentStep() - 1] = true;
        return copy;
      });
      this.currentStep.update((s) => s + 1);
      return;
    }

    this.id() === null ? this.goNext() : this.editCompany();
  }

  goNext() {
    if (!this.companyForm.valid) return;

    const raw = this.companyForm.getRawValue();

    this.next.emit(raw);
    this.resetForm();
  }

  closeSidebar(): void {
    this.save.emit(false);
    this.resetForm();
  }

  skipAndSave(): void {
    this.save.emit(true);
    this.resetForm();
  }

  resetForm() {
    this.companyForm.reset({}, { emitEvent: false });
    this.currentStep.set(1);
    this.completedSteps.set(new Array(this.totalSteps).fill(false));
  }

  editCompany() {
    const payload = {
      id: this.id(),
      ...this.companyForm.getRawValue()
    };
    this.organizationService.updateCompany(payload).subscribe({
      next: () => {
        this.toastService.addToast(
          ToastType.SUCCESS,
          this.localizationService.instant('organization.company.home.updatedMessage'),
          '',
          {},
          true,
          false
        );
      },
      error: () => {
        this.companyForm.reset();
      },
      complete: () => {
        this.update.emit(true);
      }
    });
  }
}
