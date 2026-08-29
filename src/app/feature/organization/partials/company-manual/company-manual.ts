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
import { DropdownComponent } from '../../../shared/components/primeng/drop-down/drop-down';
import { InputTextComponent } from '../../../shared/components/primeng/input-text/input-text';
import { ButtonComponent } from '../../../shared/components/primeng/button/button';
import { TranslatePipe } from '@ngx-translate/core';
import { Organization } from '../../services/organization';
import { OrganizationLogic } from '../../services/organization-logic';
import { ToastService } from '../../../../core/services/toast/toast';
import { Localization } from '../../../../core/services/localization/localization';
import { ToastType } from '../../../../core/models/enums/toast-type';
import { HierarchySteps } from '../../models/organization-creation.model';


@Component({
  selector: 'app-company-manual',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    ButtonComponent,
    TranslatePipe,
    ButtonComponent
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
    // بنبنيها هنا (بعد ما this.fb اتحط) مش كـ field initializer،
    // عشان منعتمدش على ترتيب تنفيذ الـ native class fields مع الـ parameter properties
    this.companyForm = this.fb.group({
      name: ['', [Validators.required]],
      nameArabic: [''],
      code: [''],
      countryId: ['', [Validators.required]],
      stateId: ['', [Validators.required]],
      cityId: ['', [Validators.required]],
      otherCityName: [''],
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
  countries = signal<any[]>([]);
  states = signal<any[]>([]);
  cities = signal<any[]>([]);
  id = signal<string | null>(null);
  isFirstStep = signal<boolean>(false);
  isOtherCity = signal<boolean>(false);

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

    this.getCountries();

    this.companyForm.get('countryId')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((countryId) => this.getStatesByCountryId(countryId!));

    this.companyForm.get('stateId')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((stateId) => this.getCitiesByStateId(stateId!));
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
      countryId: record.countryID ?? record.countryId,
      stateId: record.stateID ?? record.stateId,
      cityId: record.cityID ?? record.cityId,
      otherCityName: record.otherCityName,
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

  goNext() {
    if (!this.companyForm.valid) return;

    const raw = this.companyForm.getRawValue();

    const formData = {
      ...raw,
      cityId: raw.cityId === 'other' ? null : raw.cityId,
      otherCityName: raw.cityId === 'other' ? raw.otherCityName : null
    };

    this.next.emit(formData);
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
    this.isOtherCity.set(false);
  }

  getCountries(): void {
    // TODO(Mohamed): confirm method name on Organization service (was CompanyService.getCountries)
    this.organizationService.getCountries().subscribe((res: any) => {
      this.countries.set(res.map((country: any) => ({
        label: country.name,
        value: country.id
      })));
    });
  }

  getStatesByCountryId(countryId: string): void {
    this.organizationService.getStatesByCountryId(countryId).subscribe((res: any) => {
      this.states.set(res.map((state: any) => ({
        label: state.name,
        value: state.id
      })));
    });
  }

  getCitiesByStateId(stateId: string): void {
    this.organizationService.getCitiesByStateId(stateId).subscribe({
      next: (res: any) => {
        this.cities.set([
          { label: 'other', value: 'other' },
          ...res.map((city: any) => ({ label: city.name, value: city.id }))
        ]);
      },
      error: () => {
        this.cities.set([{ label: 'other', value: 'other' }]);
      }
    });
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

  onCityChange(event: any) {
    const control = this.companyForm.get('otherCityName');
    if (event === 'other') {
      this.isOtherCity.set(true);
      control?.setValidators([Validators.required]);
    } else {
      this.isOtherCity.set(false);
      control?.setValue(null);
      control?.clearValidators();
    }
    control?.updateValueAndValidity();
  }
}