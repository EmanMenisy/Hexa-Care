import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  Signal,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { InputTextComponent } from '../../../shared/components/primeng/input-text/input-text';
import { MultiSelectComponent } from '../../../shared/components/primeng/multi-select/multi-select';
import { ButtonComponent } from '../../../shared/components/primeng/button/button';
import { Organization } from '../../services/organization';
import { OrganizationLogic } from '../../services/organization-logic';
import { ToastService } from '../../../../core/services/toast/toast';
import { Localization } from '../../../../core/services/localization/localization';
import { ToastType } from '../../../../core/models/enums/toast-type';
import {
  CompanyCreate,
  GeoLocation,
  HierarchySteps,
} from '../../models/organization-creation.model';
import { LocationModal } from '../location-modal/location-modal';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { StepperComponent } from '../../../shared/components/common/stepper/stepper';

/* -------------------- internal wizard steps -------------------- */
const STEP_FIELDS: string[][] = [
  ['name', 'nameArabic', 'companyIds', 'description', 'descriptionArabic'],
  ['address', 'phone', 'email', 'country', 'state', 'city'],
  ['managerName', 'managerPhone', 'managerEmail'],
];

@Component({
  selector: 'app-branch-manual',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextComponent,
    MultiSelectComponent,
    ButtonComponent,
    LocationModal,
    TranslatePipe,
    ToggleSwitchModule,
    StepperComponent,
  ],
  templateUrl: './branch-manual.html',
  styleUrl: './branch-manual.scss',
})
export class BranchManual implements OnInit {
  branchForm: FormGroup;
  private readonly formStatus: Signal<string>;
  disabledForm: Signal<boolean>;

  constructor(
    private readonly organizationService: Organization,
    private readonly organizationLogicService: OrganizationLogic,
    private readonly toastService: ToastService,
    private readonly localizationService: Localization,
    private readonly destroyRef: DestroyRef,
    private readonly fb: FormBuilder,
  ) {
    this.branchForm = this.fb.group({
      name: ['', [Validators.required]],
      nameArabic: [''],
      description: [''],
      descriptionArabic: [''],
      address: ['', [Validators.required]],
      phone: [''],
      email: ['', [Validators.email]],
      country: ['', [Validators.required]],
      state: ['', [Validators.required]],
      city: ['', [Validators.required]],
      managerName: [''],
      managerPhone: [''],
      managerEmail: ['', [Validators.email]],
      isGeoLocationEnabled: [false],
      companyIds: [[] as string[], [Validators.required]],
    });

    this.formStatus = toSignal(this.branchForm.statusChanges, {
      initialValue: this.branchForm.status,
    });
    this.disabledForm = computed(() => this.formStatus() !== 'VALID');
  }

  /* -------------------- inputs / outputs -------------------- */
  company = input<CompanyCreate | null>(null);
  next = output<any>();
  save = output<boolean>();
  update = output<boolean>();

  /* -------------------- state (signals) -------------------- */
  companies = signal<any[]>([]);
  id = signal<string | null>(null);
  isFirstStep = signal<boolean>(false);
  showMapModal = signal<boolean>(false);
  geoLocation = signal<GeoLocation | null>(null);

  mapData = computed(() => (this.geoLocation() ? [this.geoLocation()!] : []));

  /* -------------------- internal wizard (stepper) -------------------- */
  totalSteps = STEP_FIELDS.length;
  currentStep = signal<number>(1);
  completedSteps = signal<boolean[]>(new Array(this.totalSteps).fill(false));
  stepperSteps = [
    { label: 'organization.branch.steps.basicInformation' },
    { label: 'organization.branch.steps.contactAndLocation' },
    { label: 'organization.branch.steps.managementInformation' },
  ];
  isLastStep = computed(() => this.currentStep() === this.totalSteps);

  /* -------------------- code generation -------------------- */
  private generateCode(name: string): string {
    const randomNum = Math.floor(Math.random() * 1001);
    return `${name}-${randomNum}`;
  }

  ngOnInit(): void {
    this.initBranchId();
    this.initStepListener();
    this.getCompanies();

    this.branchForm
      .get('isGeoLocationEnabled')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((enabled) => {
        if (enabled) {
          this.showMapModal.set(true);
        } else {
          this.geoLocation.set(null);
        }
      });
  }

  private initBranchId(): void {
    this.organizationLogicService.id$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((id) => {
      if (id) {
        this.id.set(id);
        this.getBranchById(id);
      }
    });
  }

  private initStepListener(): void {
    this.organizationLogicService.start$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((step) => {
        this.isFirstStep.set(step === HierarchySteps.Branch);
      });
  }

  /* -------------------- wizard navigation -------------------- */
  onStepChange(step: number): void {
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
    return fields.every((field) => {
      const control = this.branchForm.get(field);
      if (!control) return true;
      return control.disabled || control.valid;
    });
  }

  private touchStep(step: number): void {
    const fields = STEP_FIELDS[step - 1] ?? [];
    fields.forEach((field) => this.branchForm.get(field)?.markAsTouched());
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

    this.id() === null ? this.goNext() : this.editBranch();
  }

  goNext() {
    if (!this.branchForm.valid) return;

    const formData = this.buildFormData();
    this.next.emit(formData as any);
    this.resetForm();
  }

  closeSidebar(): void {
    this.organizationLogicService.setId(null);
    this.save.emit(false);
    this.resetForm();
  }

  skipAndSave(): void {
    this.save.emit(true);
    this.resetForm();
  }

  private buildFormData() {
    const raw = this.branchForm.getRawValue();

    return {
      ...raw,
      code: this.generateCode(raw.name),
      location: this.geoLocation(),
    };
  }

  resetForm() {
    this.branchForm.reset({}, { emitEvent: false });
    this.geoLocation.set(null);
    this.currentStep.set(1);
    this.completedSteps.set(new Array(this.totalSteps).fill(false));
  }

  getCompanies(): void {
    const company = this.company();
    if (company) {
      this.handleSingleCompany(company);
      return;
    }

    this.organizationService.getStructureBasedOnRoleScope().subscribe({
      next: (res: any) => {
        this.companies.set(
          res.companies.map((c: any) => ({
            label: c.name,
            value: c.companyId,
          })),
        );
      },
    });
  }

  private handleSingleCompany(company: CompanyCreate): void {
    this.companies.set([{ label: company.name, value: company.name }]);

    const companyIdsControl = this.branchForm.get('companyIds');
    companyIdsControl?.setValue([company.name]);
    companyIdsControl?.disable();
  }

  getBranchById(id: string) {
    this.organizationService.getBranchById(id).subscribe((res: any) => {
      this.branchForm.patchValue({
        name: res.name,
        nameArabic: res.nameArabic,
        description: res.description,
        descriptionArabic: res.descriptionArabic,
        address: res.address,
        phone: res.phone,
        email: res.email,
        country: res.country,
        state: res.state,
        city: res.city,
        managerName: res.managerName,
        managerPhone: res.managerPhone,
        managerEmail: res.managerEmail,
        companyIds: res.companyIds,
      } as any);
      if (res.location) {
        this.branchForm.get('isGeoLocationEnabled')?.setValue(true, { emitEvent: false });
        this.geoLocation.set(res.location);
      }
    });
  }

  editBranch() {
    const payload = {
      id: this.id(),
      ...this.branchForm.getRawValue(),
      location: this.geoLocation(),
    };
    this.organizationService.updateBranch(payload).subscribe({
      next: () => {
        this.toastService.addToast(
          ToastType.SUCCESS,
          this.localizationService.instant('organization.branch.home.updatedMessage'),
          '',
          {},
          true,
          false,
        );
      },
      error: () => {
        this.branchForm.reset();
      },
      complete: () => {
        this.update.emit(true);
      },
    });
  }

  /* -------------------- geolocation modal -------------------- */
  openMapModal(): void {
    this.showMapModal.set(true);
  }

  onLocationModalClose(): void {
    this.showMapModal.set(false);
    if (!this.geoLocation()) {
      this.branchForm.get('isGeoLocationEnabled')?.setValue(false, { emitEvent: false });
    }
  }

  onLocationSelected(locations: GeoLocation[]): void {
    this.geoLocation.set(locations?.[0] ?? null);
    this.showMapModal.set(false);
  }
}
