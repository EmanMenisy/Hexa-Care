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
  signal
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { EMPTY, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { DropdownComponent } from '../../../shared/components/primeng/drop-down/drop-down';
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
  HierarchySteps
} from '../../models/organization-creation.model';
import { LocationModal } from '../location-modal/location-modal';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-branch-manual',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    MultiSelectComponent,
    ButtonComponent,
    LocationModal,
    TranslatePipe,
    ToggleSwitchModule
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
    private readonly fb: FormBuilder
  ) {
    this.branchForm = this.fb.group({
      name: ['', [Validators.required]],
      nameArabic: [''],
      description: [''],
      descriptionArabic: [''],
      address: [''],
      phone: [''],
      email: ['', [Validators.email]],
      countryId: ['', [Validators.required]],
      stateId: [null as string | null],
      cityId: ['', [Validators.required]],
      otherCityName: [null as string | null],
      managerName: [''],
      managerPhone: [''],
      managerEmail: ['', [Validators.email]],
      isGeoLocationEnabled: [false],
      companyIds: [[] as string[], [Validators.required]]
    });

    this.formStatus = toSignal(this.branchForm.statusChanges, {
      initialValue: this.branchForm.status
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
  countries = signal<any[]>([]);
  cities = signal<any[]>([]);
  states = signal<any[]>([]);
  id = signal<string | null>(null);
  isFirstStep = signal<boolean>(false);
  isCityDisabled = signal<boolean>(true);
  isOtherCity = signal<boolean>(false);
  showMapModal = signal<boolean>(false);
  geoLocation = signal<GeoLocation | null>(null);

  mapData = computed(() => (this.geoLocation() ? [this.geoLocation()!] : []));

  ngOnInit(): void {
    this.initBranchId();
    this.initStepListener();
    this.getCompanies();
    this.getCountries();
    this.initCompanyIdsListener();

    this.branchForm.get('countryId')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((countryId) => this.getStatesByCountryId(countryId!));

    this.branchForm.get('isGeoLocationEnabled')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((enabled) => {
        if (enabled) {
          this.showMapModal.set(true);
        } else {
          this.geoLocation.set(null);
        }
      });
  }

  private initBranchId(): void {
    this.organizationLogicService.id$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => {
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
        this.isCityDisabled.set(this.isFirstStep());
      });
  }

  private initCompanyIdsListener(): void {
    const companyIdsControl = this.branchForm.get('companyIds');
    if (!companyIdsControl) return;

    companyIdsControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
        switchMap((companyIds: string[]) => this.handleCompanyIdsChange(companyIds))
      )
      .subscribe({
        next: (cities) => this.handleCitiesResponse(cities),
        error: (err) => this.handleCitiesError(err)
      });
  }

  private handleCitiesError(err: unknown): void {
    console.error(err);
    this.resetCities();
  }

  private resetCities(): void {
    this.cities.set([]);
    this.states.set([]);
    this.isCityDisabled.set(true);
    this.isOtherCity.set(false);
  }

  private handleCitiesResponse(res: any): void {
    if (!res?.length) {
      this.resetCities();
      return;
    }
    this.states.set(res.map((state: any) => ({ label: state.name, value: state.id })));

    this.cities.set([
      { label: 'other', value: 'other' },
      ...res.flatMap((state: any) =>
        state.cityResponseDtos.map((city: any) => ({
          label: city.name,
          value: city.id
        }))
      )
    ]);

    this.isCityDisabled.set(false);
  }

  private handleCompanyIdsChange(companyIds: string[]) {
    if (!companyIds?.length) {
      this.resetCities();
      return EMPTY;
    }

    this.isCityDisabled.set(true);
    return this.organizationService.getCitiesByCompanyIds(companyIds);
  }

  private getStatesByCountryId(countryId: string): void {
    if (!countryId) {
      this.states.set([]);
      return;
    }
    this.organizationService.getStatesByCountryId(countryId).subscribe((res: any) => {
      this.states.set(res.map((state: any) => ({ label: state.name, value: state.id })));
    });
  }

  getCountries(): void {
    this.organizationService.getCountries().subscribe((res: any) => {
      this.countries.set(res.map((country: any) => ({
        label: country.name,
        value: country.id
      })));
    });
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
    const isOther = raw.cityId === 'other';

    return {
      ...raw,
      cityId: isOther ? null : raw.cityId,
      stateId: isOther ? raw.stateId : null,
      otherCityName: isOther ? raw.otherCityName : null,
      location: this.geoLocation()
    };
  }

  resetForm() {
    this.branchForm.reset({}, { emitEvent: false });
    this.geoLocation.set(null);
    this.isOtherCity.set(false);
  }

  getCitiesByStateId(): void {
    const company = this.company();
    if (company && company.stateId) {
      this.organizationService.getCitiesByStateId(company.stateId).subscribe((res: any) => {
        this.cities.set([
          { label: 'other', value: 'other' },
          ...res.map((city: any) => ({ label: city.name, value: city.id }))
        ]);
      });
    }
  }

  getCompanies(): void {
    const company = this.company();
    if (company) {
      this.handleSingleCompany(company);
      return;
    }

    this.organizationService.getStructureBasedOnRoleScope().subscribe({
      next: (res: any) => {
        this.companies.set(res.companies.map((c: any) => ({
          label: c.name,
          value: c.companyId
        })));
      }
    });
  }

  private handleSingleCompany(company: CompanyCreate): void {
    this.companies.set([{ label: company.name, value: company.name }]);

    const companyIdsControl = this.branchForm.get('companyIds');
    companyIdsControl?.setValue([company.name]);
    companyIdsControl?.disable();

    if (company.stateId) {
      this.getCitiesByStateId();
    }
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
        countryId: res.countryID ?? res.countryId,
        stateId: res.stateID ?? res.stateId,
        cityId: res.cityID ?? res.cityId,
        otherCityName: res.otherCityName,
        managerName: res.managerName,
        managerPhone: res.managerPhone,
        managerEmail: res.managerEmail,
        companyIds: res.companyIds
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
      location: this.geoLocation()
    };
    this.organizationService.updateBranch(payload).subscribe({
      next: () => {
        this.toastService.addToast(
          ToastType.SUCCESS,
          this.localizationService.instant('organization.branch.home.updatedMessage'),
          '',
          {},
          true,
          false
        );
      },
      error: () => {
        this.branchForm.reset();
      },
      complete: () => {
        this.update.emit(true);
      }
    });
  }

  onCityChange(event: any) {
    const otherCityControl = this.branchForm.get('otherCityName');
    const stateControl = this.branchForm.get('stateId');

    if (event === 'other') {
      this.isOtherCity.set(true);
      otherCityControl?.setValidators([Validators.required]);
      if (this.isFirstStep()) {
        stateControl?.setValidators([Validators.required]);
      }
    } else {
      this.isOtherCity.set(false);
      otherCityControl?.setValue(null);
      stateControl?.setValue(null);
      otherCityControl?.clearValidators();
      stateControl?.clearValidators();
    }

    otherCityControl?.updateValueAndValidity();
    stateControl?.updateValueAndValidity();
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