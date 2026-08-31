import { Component, computed, DestroyRef, effect, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import {
  KpiItem,
  MOCK_CAPACITY_DATA,
  MOCK_PROFILE_DATA,
  ORG_PROFILE_ACTIONS,
  OrganizationProfileData,
  ProfileMode,
} from '../../models/organization.model';
import { Organization } from '../../services/organization';
import { KpiCard } from '../../partials/kpi-card/kpi-card';
import { delay, of } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/primeng/button/button';
import { Table } from '../../../shared/components/common/table/table';
import {
  ISortEvent,
  ITableAction,
} from '../../../shared/components/common/table/models/table.types';
import { ITableHeader } from '../../../../core/models/interface/ItableHeader';
import { ApiStatus } from '../../../../core/models/enums/api-status';
import { TableHeaderType } from '../../../../core/models/enums/table-header-type';
import { NativeTableColumnTemplateDirective } from '../../../shared/components/common/table/directives/native-table-column-template.directive';
import { InputTextComponent } from '../../../shared/components/primeng/input-text/input-text';
import { InputNumber } from '../../../shared/components/primeng/input-number/input-number';
import { HexaSubHeader } from '../../../shared/layout/hexa-sub-header/hexa-sub-header';
import { HeaderButton } from '../../../shared/layout/hexa-sub-header/models/header-config.model';

@Component({
  selector: 'app-organization-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    KpiCard,
    ButtonComponent,
    Table,
    NgClass,
    NativeTableColumnTemplateDirective,
    InputTextComponent,
    InputNumber,
    HexaSubHeader,
  ],
  templateUrl: './organization-profile.html',
  styleUrl: './organization-profile.scss',
})
export class OrganizationProfile {
  // --- mode flag ---
  mode = signal<ProfileMode>('view');
  isEditMode = computed(() => this.mode() === 'edit');

  // --- identity / read-only ---
  organizationId = signal<string | null>(null);

  // --- logo (file, not a plain text/url field) ---
  logoUrl = signal<string | null>(null); // local preview only, never sent to the API
  selectedLogo = signal<File | null>(null); // the actual "logo" file sent on save
  private initialValue: ReturnType<FormGroup['getRawValue']> | null = null;
  private initialLogoUrl: string | null = null;
  private initialSelectedLogo: File | null = null;

  // --- KPIs ---
  kpis = signal<KpiItem[]>([
    {
      label: 'organization.organizationProfile.kpis.totalBeds',
      value: 0,
      icon: 'pi pi-inbox',
      iconBg: '#e8f0fe',
      trend: '0 items',
      trendLabel: 'organization.organizationProfile.kpis.vsLastPeriod',
    },
    {
      label: 'organization.organizationProfile.kpis.criticalCare',
      value: 32,
      icon: 'pi pi-heart-fill',
      iconBg: '#fdeaea',
      trend: '3 items',
      trendLabel: 'organization.organizationProfile.kpis.vsLastPeriod',
    },
    {
      label: 'organization.organizationProfile.kpis.operationRooms',
      value: 6,
      icon: 'pi pi-users',
      iconBg: '#e6f6ee',
    },
    {
      label: 'organization.organizationProfile.kpis.clinics',
      value: 12,
      icon: 'pi pi-briefcase',
      iconBg: '#eee6fb',
    },
    {
      label: 'organization.organizationProfile.kpis.departments',
      value: 20,
      icon: 'pi pi-sitemap',
      iconBg: '#fdf1e0',
    },
    {
      label: 'organization.organizationProfile.kpis.rooms',
      value: 22,
      icon: 'pi pi-building',
      iconBg: '#e3f2fb',
    },
  ]);

  //table
  activeSortField?: string;
  activeSortAscending: boolean | null = null;
  tableColumns: ITableHeader[] = [];
  tableActions: ITableAction[] = [];
  PageStatus = ApiStatus;
  pageStatus: ApiStatus = ApiStatus.Loading;
  totalRecordsLength: number = 0;
  capacityList = signal<any[]>([]);
  // Request
  capacityRequest: any = {
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
  };
  //form
  form!: FormGroup;
  constructor(
    private readonly fb: FormBuilder,
    private readonly destroyRef: DestroyRef,
    private readonly organizationService: Organization,
  ) {
    this.form = this.buildForm();

    effect(() => {
      if (this.isEditMode()) {
        this.form.enable({ emitEvent: false });
      } else {
        this.form.disable({ emitEvent: false });
      }
    });

    this.loadProfile();
  }
  ngOnInit(): void {
    this.getTableActions();
    this.getTableColumns();
    this.getAllCapacities();
  }

  // Flat form matching the organization update DTO 1:1 (id + logo are handled outside the form).
  private buildForm() {
    return this.fb.group({
      isActive: [true],
      name: [''],
      nameArabic: [''],
      code: [''],
      commercialRegisterNo: [''],
      taxNumber: [''],
      licenseNumber: [''],
      currency: [''],
      description: [''],
      descriptionArabic: [''],

      address: [''],
      city: [''],
      country: [''],
      phone: [''],
      phone2: [''],
      hotline: [''],
      fax: [''],
      email: ['', Validators.email],
      website: [''],

      managerName: [''],
      managerPhone: [''],
      managerEmail: ['', Validators.email],
      deputyManagerName: [''],
      deputyManagerPhone: [''],
      deputyManagerEmail: ['', Validators.email],
      chairmanName: [''],
      chairmanPhone: [''],
      chairmanEmail: ['', Validators.email],
      medicalDirector: [''],

      beds: [0],
      operationRooms: [0],
      icuBeds: [0],
      intermediateCareBeds: [0],
      incubators: [0],
      emergencyBeds: [0],
      outpatientClinics: [0],
    });
  }

  private loadProfile(): void {
    of(MOCK_PROFILE_DATA)
      .pipe(delay(500), takeUntilDestroyed(this.destroyRef))
      .subscribe((data: OrganizationProfileData) => {
        const { id, logo, ...formValue } = data as any;

        this.organizationId.set(id ?? null);
        this.form.patchValue(formValue);

        if (logo) {
          // initial value coming from the server is a URL used only for preview
          this.logoUrl.set(logo);
        }
        this.captureSnapshot();
      });
  }

  private captureSnapshot(): void {
    this.initialValue = this.form.getRawValue();
    this.initialLogoUrl = this.logoUrl();
    this.initialSelectedLogo = this.selectedLogo();
  }

  onEditClick(): void {
    this.captureSnapshot();
    this.mode.set('edit');
  }
  onCancel(): void {
    if (this.initialValue) {
      this.form.patchValue(this.initialValue);
    }
    this.logoUrl.set(this.initialLogoUrl);
    this.selectedLogo.set(this.initialSelectedLogo);
    this.mode.set('view');
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      id: this.organizationId(),
      ...this.form.getRawValue(),
      logo: this.selectedLogo(),
    };

    this.captureSnapshot();
    this.mode.set('view');
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.selectedLogo.set(file);

    const reader = new FileReader();

    reader.onload = () => {
      this.logoUrl.set(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  // ===== Get All =====
  getAllCapacities(pageNumber = 1): void {
    this.pageStatus = ApiStatus.Loading;
    this.capacityRequest = { ...this.capacityRequest, pageNumber };

    of(MOCK_CAPACITY_DATA)
      .pipe(delay(500), takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.capacityList.set(data);
        this.totalRecordsLength = data.length;
        this.pageStatus = ApiStatus.Success;
      });
  }
  // ===== Table Columns =====
  getTableColumns(): void {
    this.tableColumns = [
      {
        field: 'rank',
        name: 'organization.organizationProfile.table.headers.rank',
        type: TableHeaderType.String,
        sortable: true,
      },
      {
        field: 'itemName',
        name: 'organization.organizationProfile.table.headers.item',
        type: TableHeaderType.String,
        sortable: false,
      },
      {
        field: 'category',
        name: 'organization.organizationProfile.table.headers.category',
        type: TableHeaderType.String,
        sortable: false,
      },
      {
        field: 'classification',
        name: 'organization.organizationProfile.table.headers.classification',
        type: TableHeaderType.String,
        sortable: false,
      },
      {
        field: 'count',
        name: 'organization.organizationProfile.table.headers.count',
        type: TableHeaderType.String,
      },
      {
        field: 'unit',
        name: 'organization.organizationProfile.table.headers.unit',
        type: TableHeaderType.String,
      },
      {
        field: 'isActive',
        name: 'organization.organizationProfile.table.headers.status',
        type: TableHeaderType.String,
      },
    ] as ITableHeader[];
  }
  // ===== Table Actions =====
  getTableActions(): void {
    this.tableActions = [
      {
        key: 'menuItem',
        type: 'menu',
        icon: 'pi pi-ellipsis-v',
        visible: true,
        items: [
          {
            key: 'edit',
            label: 'Edit',
            icon: 'pi pi-pencil',
            visible: true,
          },
          {
            key: 'delete',
            label: 'delete',
            icon: 'pi pi-trash',
            visible: true,
          },
        ],
      },
    ];
  }
  // =====ON Table Actions Fire =====
  onTableAction(event: { action: string; row: any }): void {
    switch (event.action) {
      case 'edit':
        this.onEdit(event.row.id);
        break;
      case 'delete':
        this.onDelete(event.row.id);
        break;
    }
  }
  onEdit(id: string) {}
  onDelete(id: string) {}
  // ===== Sort =====
  onSortChanged(event: ISortEvent): void {
    this.activeSortField = event.field;
    this.activeSortAscending = event.isAscending;

    this.capacityRequest = {
      ...this.capacityRequest,
      sortBy: event.field,
      isAscending: event.isAscending,
    } as any;

    this.getAllCapacities();
  }

  headerButtons = computed<HeaderButton[]>(() => {
    const isEdit = this.isEditMode();
    return [
      {
        icon: 'pi pi-arrow-right',
        severity: 'primary',
        action: ORG_PROFILE_ACTIONS.EDIT,
        label: 'Update',
        visible: !isEdit,
      },
      {
        label: 'Save',
        icon: 'pi pi-check',
        severity: 'primary',
        action: ORG_PROFILE_ACTIONS.SAVE,
        visible: isEdit,
      },
      {
        label: 'Cancel',
        icon: 'pi pi-times',
        severity: 'secondary',
        action: ORG_PROFILE_ACTIONS.CANCEL,
        visible: isEdit,
      },
    ];
  });
  onHeaderAction(action: string): void {
    switch (action) {
      case ORG_PROFILE_ACTIONS.EDIT:
        this.onEditClick();
        break;
      case ORG_PROFILE_ACTIONS.CANCEL:
        this.onCancel();
        break;
      case ORG_PROFILE_ACTIONS.SAVE:
        this.onSave();
        break;
    }
  }
}
