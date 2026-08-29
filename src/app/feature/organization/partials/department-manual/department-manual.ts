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
import { InputTextComponent } from '../../../shared/components/primeng/input-text/input-text';
import { MultiSelectComponent } from '../../../shared/components/primeng/multi-select/multi-select';
import { ButtonComponent } from '../../../shared/components/primeng/button/button';
import { Organization } from '../../services/organization';
import { OrganizationLogic } from '../../services/organization-logic';
import { ToastService } from '../../../../core/services/toast/toast';
import { Localization } from '../../../../core/services/localization/localization';
import { ToastType } from '../../../../core/models/enums/toast-type';
import { BranchCreate, HierarchySteps } from '../../models/organization-creation.model';

@Component({
  selector: 'app-department-manual',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextComponent,
    MultiSelectComponent,
    ButtonComponent,
    TranslatePipe
  ],
  templateUrl: './department-manual.html',
  styleUrl: './department-manual.scss',
})
export class DepartmentManual implements OnInit {
  departmentForm: FormGroup;
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
    // بنبنيها هنا (بعد ما this.fb اتحط) مش كـ field initializer،
    // عشان منعتمدش على ترتيب تنفيذ الـ native class fields مع الـ parameter properties
    this.departmentForm = this.fb.group({
      name: ['', [Validators.required]],
      nameArabic: [''],
      description: [''],
      descriptionArabic: [''],
      managerName: [''],
      managerPhone: [''],
      managerEmail: ['', [Validators.email]],
      extension: [''],
      location: [''],
      branchIds: [[] as string[], Validators.required]
    });

    this.formStatus = toSignal(this.departmentForm.statusChanges, {
      initialValue: this.departmentForm.status
    });
    this.disabledForm = computed(() => this.formStatus() !== 'VALID');
  }

  /* -------------------- inputs / outputs -------------------- */
  branch = input<BranchCreate | null>(null);
  next = output<any>();
  save = output<boolean>();
  update = output<boolean>();

  /* -------------------- state (signals) -------------------- */
  id = signal<string | null>(null);
  isFirstStep = signal<boolean>(false);
  branchList = signal<any[]>([]);

  ngOnInit(): void {
    this.organizationLogicService.id$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => {
        if (id) {
          this.id.set(id);
          this.getDepartmentById(id);
        }
      });
    this.getBranchList();
    this.organizationLogicService.start$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((start) => {
        this.isFirstStep.set(start === HierarchySteps.Department);
      });
  }

  resetForm() {
    this.departmentForm.reset({}, { emitEvent: false });
  }

  getBranchList() {
    const branch = this.branch();
    if (branch) {
      this.branchList.set([{ label: branch.name, value: branch.name }]);
      this.departmentForm.get('branchIds')?.setValue([branch.name]);
      this.departmentForm.get('branchIds')?.disable();
    } else {
      // TODO(Mohamed): confirm method name on Organization service (was LookupsService.getStructureBasedOnRoleScope)
      this.organizationService.getStructureBasedOnRoleScope().subscribe((res: any) => {
        this.branchList.set(res.branches.map((b: any) => ({
          label: b.name,
          value: b.branchId
        })));
      });
    }
  }

  getDepartmentById(id: string) {
    // TODO(Mohamed): confirm method name on Organization service (was DepartmentService.getDepartmentById)
    this.organizationService.getDepartmentById(id).subscribe({
      next: (res: any) => {
        this.departmentForm.patchValue({
          name: res.name,
          nameArabic: res.nameArabic,
          description: res.description,
          descriptionArabic: res.descriptionArabic,
          managerName: res.managerName,
          managerPhone: res.managerPhone,
          managerEmail: res.managerEmail,
          extension: res.extension,
          location: res.location,
          branchIds: res.branchIDs
        } as any);
      }
    });
  }

  editDepartment() {
    if (!this.departmentForm.valid) return;
    const request = {
      ...this.departmentForm.getRawValue(),
      id: this.id()
    };
    this.organizationService.onUpdateDepartment(request).subscribe({
      next: () => {
        this.toastService.addToast(
          ToastType.SUCCESS,
          this.localizationService.instant('organization.department.home.updatedMessage'),
          '',
          {},
          true,
          false
        );
      },
      error: () => {
        this.departmentForm.reset();
      },
      complete: () => {
        this.update.emit(true);
      }
    });
  }

  /* -------------------- Sidebar Buttons  -------------------- */
  goNext() {
    if (!this.departmentForm.valid) return;
    const formData = this.departmentForm.getRawValue();
    this.next.emit(formData as any);
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
}