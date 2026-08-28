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
import { HeaderActionService } from '../../../shared/layout/sub-header/services/header-action.service';
import { HeaderButtonStateService } from '../../../shared/layout/sub-header/services/header-button-state.service';
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

// ideally move this to organization.model.ts alongside KpiItem

@Component({
  selector: 'app-organization-profile',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, KpiCard, ButtonComponent, Table, NgClass,NativeTableColumnTemplateDirective],
  templateUrl: './organization-profile.html',
  styleUrl: './organization-profile.scss',
})
export class OrganizationProfile {
  // --- mode flag ---
  mode = signal<ProfileMode>('view');
  isEditMode = computed(() => this.mode() === 'edit');

  // --- logo ---
  logoUrl = signal<string | null>(null);
  selectedLogo = signal<File | null>(null);
  private initialValue: ReturnType<FormGroup['getRawValue']> | null = null;
  private initialLogoUrl: string | null = null;

  // --- KPIs ---
  kpis = signal<KpiItem[]>([
    {
      label: 'organization.organizationProfile.kpis.totalBeds',
      value: 0,
      icon: 'pi pi-inbox',
      iconBg: '#e8f0fe',
      trend: '0 items',
      trendLabel:'organization.organizationProfile.kpis.vsLastPeriod',
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
    private readonly headerActionService: HeaderActionService,
    private readonly headerButtonStateService: HeaderButtonStateService,
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

    this.setViewButtonsState();

    this.headerActionService.action$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((action) => this.handleHeaderAction(action));

    this.loadProfile();
  }
  ngOnInit(): void {
    this.getTableActions();
    this.getTableColumns();
    this.getAllCapacities();
  }
  private buildForm() {
    return this.fb.group({
      basicData: this.fb.group({
        nameAr: [''],
        nameEn: [''],
        commercialRegister: [''],
        taxNumber: [''],
        licenseNumber: [''],
        currency: [''],
      }),
      contactData: this.fb.group({
        address: [''],
        city: [''],
        country: [''],
        phone1: [''],
        phone2: [''],
        fax: [''],
        email: ['', Validators.email],
        website: [''],
      }),
      administration: this.fb.group({
        hospitalManager: [''],
        managerPhone: [''],
        managerEmail: ['', Validators.email],
        medicalDirector: [''],
      }),
    });
  }

  private loadProfile(): void {
    of(MOCK_PROFILE_DATA)
      .pipe(delay(500), takeUntilDestroyed(this.destroyRef))
      .subscribe((data: OrganizationProfileData) => {
        this.form.patchValue({
          basicData: data.basicData,
          contactData: data.contactData,
          administration: data.administration,
        });
        if (data.logoUrl) {
          this.logoUrl.set(data.logoUrl);
        }
        this.captureSnapshot();
      });
  }

  private handleHeaderAction(action: string): void {
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

  private captureSnapshot(): void {
    this.initialValue = this.form.getRawValue();
    this.initialLogoUrl = this.logoUrl();
  }

  private setViewButtonsState(): void {
    this.headerButtonStateService.setState(ORG_PROFILE_ACTIONS.EDIT, { hidden: false });
    this.headerButtonStateService.setState(ORG_PROFILE_ACTIONS.CANCEL, { hidden: true });
    this.headerButtonStateService.setState(ORG_PROFILE_ACTIONS.SAVE, { hidden: true });
  }

  private setEditButtonsState(): void {
    this.headerButtonStateService.setState(ORG_PROFILE_ACTIONS.EDIT, { hidden: true });
    this.headerButtonStateService.setState(ORG_PROFILE_ACTIONS.CANCEL, { hidden: false });
    this.headerButtonStateService.setState(ORG_PROFILE_ACTIONS.SAVE, { hidden: false });
  }

  onEditClick(): void {
    this.captureSnapshot();
    this.mode.set('edit');
    this.setEditButtonsState();
  }

  onCancel(): void {
    if (this.initialValue) {
      this.form.patchValue(this.initialValue);
    }
    this.logoUrl.set(this.initialLogoUrl);
    this.mode.set('view');
    this.setViewButtonsState();
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();

    this.captureSnapshot();
    this.mode.set('view');
    this.setViewButtonsState();
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
}