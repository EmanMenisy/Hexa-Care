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
import { DepartmentCreate, HierarchySteps } from '../../models/organization-creation.model';

@Component({
  selector: 'app-team-manual',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextComponent,
    MultiSelectComponent,
    ButtonComponent,
    TranslatePipe
  ],
  templateUrl: './team-manual.html',
  styleUrl: './team-manual.scss',
})
export class TeamManual implements OnInit {
  teamForm: FormGroup;
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
    this.teamForm = this.fb.group({
      name: ['', [Validators.required]],
      departmentIds: [[] as string[], Validators.required]
    });

    this.formStatus = toSignal(this.teamForm.statusChanges, {
      initialValue: this.teamForm.status
    });
    this.disabledForm = computed(() => this.formStatus() !== 'VALID');
  }

  /* -------------------- inputs / outputs -------------------- */
  department = input<DepartmentCreate | null>(null);
  submit = output<any>();
  save = output<boolean>();
  update = output<boolean>();

  /* -------------------- state (signals) -------------------- */
  id = signal<string | null>(null);
  isFirstStep = signal<boolean>(false);
  departmentList = signal<any[]>([]);

  ngOnInit(): void {
    this.organizationLogicService.id$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => {
        if (id) {
          this.id.set(id);
          this.getTeamById(id);
        }
      });
    this.organizationLogicService.start$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((start) => {
        this.isFirstStep.set(start === HierarchySteps.Team);
      });
    this.getDepartmentList();
  }

  resetForm() {
    this.teamForm.reset({}, { emitEvent: false });
  }

  getDepartmentList() {
    const department = this.department();
    if (department) {
      this.departmentList.set([{ label: department.name, value: department.name }]);
      this.teamForm.get('departmentIds')?.setValue([department.name]);
      this.teamForm.get('departmentIds')?.disable();
    } else {
      // TODO(Mohamed): confirm method name on Organization service (was LookupsService.getStructureBasedOnRoleScope)
      this.organizationService.getStructureBasedOnRoleScope().subscribe((res: any) => {
        this.departmentList.set(res.departments.map((d: any) => ({
          label: d.name,
          value: d.departmentId
        })));
      });
    }
  }

  getTeamById(id: string) {
    // TODO(Mohamed): confirm method name on Organization service (was TeamService.getTeamById)
    this.organizationService.getTeamById(id).subscribe({
      next: (res: any) => {
        this.teamForm.patchValue({
          name: res.name,
          departmentIds: res.departmentIds
        });
      }
    });
  }

  editTeam() {
    if (!this.teamForm.valid) return;
    const request = {
      ...this.teamForm.getRawValue(),
      id: this.id()
    };
    this.organizationService.onUpdateTeam(request).subscribe({
      next: () => {
        this.toastService.addToast(
          ToastType.SUCCESS,
          this.localizationService.instant('organization.team.home.updatedMessage'),
          '',
          {},
          true,
          false
        );
      },
      error: () => {
        this.teamForm.reset();
      },
      complete: () => {
        this.update.emit(true);
      }
    });
  }

  /* -------------------- Sidebar Buttons  -------------------- */
  goNext() {
    if (this.teamForm.invalid) return;
    const formData = this.teamForm.getRawValue();
    this.submit.emit(formData as any);
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