import {
  Component,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StepperComponent } from '../../../../shared/components/common/stepper/stepper';
import { TranslatePipe } from '@ngx-translate/core';
import { DrawerModule } from 'primeng/drawer';
import { InputTextComponent } from '../../../../shared/components/primeng/input-text/input-text';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Roleservice } from '../../service/roleservice';
import { DropdownComponent } from '../../../../shared/components/primeng/drop-down/drop-down';
import { ButtonComponent } from '../../../../shared/components/primeng/button/button';
import { AssignStructureComponent } from '../../../../shared/components/common/assign-structure/assign-structure';
import { AssignStructure } from '../../../../../core/services/assign-structure/assign-structure';
import { ApiStatus } from '../../../../../core/models/enums/api-status';
import { ToastService } from '../../../../../core/services/toast/toast';
import { ToastType } from '../../../../../core/models/enums/toast-type';
import { Localization } from '../../../../../core/services/localization/localization';
import { ParentRole, RolePayload } from '../../modals/role';

@Component({
  selector: 'app-manual-role',
  imports: [
    StepperComponent,
    DropdownComponent,
    ReactiveFormsModule,
    ToggleSwitchModule,
    TranslatePipe,
    DrawerModule,
    InputTextComponent,
    ButtonComponent,
    AssignStructureComponent,
  ],
  templateUrl: './manual-role.html',
  styleUrl: './manual-role.scss',
})
export class ManualRole implements OnInit, OnChanges {
  visible = input<boolean>(false);
  model = input<any>(null);

  closeDialog = output<void>();
  pageStatus: ApiStatus | null = null;
  private readonly fb = inject(FormBuilder);
  private readonly roleservice = inject(Roleservice);
  public readonly assignService = inject(AssignStructure);
  public readonly toasterService = inject(ToastService);
  public readonly localizationService = inject(Localization);

  roleForm!: FormGroup;
  showSuccess = signal<boolean>(false);
  currentStep = signal<number>(1);
  completedSteps = signal<boolean[]>([false, false]);

  parentRolesOptions = signal<any[]>([]);
  roleFeaturesOptions = signal<any[]>([]);

  ngOnInit(): void {
    this.initializeForm();
    this.getAllParentRole();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Sidebar opened
    if (changes['visible'] && this.visible()) {
      this.resetStepperState();
      this.getAllParentRole();
      // Only reset form if CREATE MODE
      if (!this.model()) {
        this.resetForm();
      }

      this.assignService.loadStructureData(this.uiStructure, this.model());
    }

    // Model changed
    if (changes['model'] && this.model()) {
      // Patch fields AFTER reset is finished
      this.patchRoleForm(this.model());
      // this.getAllParentRole(this.model().id)
    }
  }
  // Initialize Role Form
  private initializeForm(): void {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      roleCode: ['', [Validators.required]],
      parentRoleId: [null, [Validators.required]],
      isActive: [false],
      roleCopierFeatureId: [null],
      uiStructure: this.fb.group({
        assignForSpecificStructure: [false],
        selectedCompanies: [[]],
        selectedBranches: [[]],
        selectedDepartments: [[]],
        selectedTeams: [],
      }),
    });
  }

  patchRoleForm(role: any): void {
    if (!role) return;
    const parentId = role.parentViewModels?.[0]?.id;
    this.roleForm.patchValue({
      name: role.name || null,
      description: role.description || null,
      roleCode: role.roleCode || null,
      roleCopierFeatureId: role.roleCopierFeatureId,
      parentRoleId: role.parentViewModels?.[0]?.id || null,
      isActive: role.isActive || false,
    });
    this.getAllChildrenRoles(role.parentViewModels?.[0]?.id);
  }

  getAllParentRole(id?: string): void {
    this.roleservice.getAllParentRoles().subscribe({
      next: (res) => {
        this.parentRolesOptions.set(res);
        console.log(res, 'get all create');
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  onParentChange(event: any): void {
    this.getAllChildrenRoles(event);
  }

  getAllChildrenRoles(id: string): void {
    this.roleservice.getAllChildrenRoles(id).subscribe({
      next: (res) => {
        this.roleFeaturesOptions.set(res);
        console.log(res, 'get all from child');
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  onStepChange(step: any): void {
    this.currentStep = step;
  }

  submit(): void {
    if (!this.assignService.organizationalStructure) {
      return;
    }

    const toggle = this.uiStructure.get('assignForSpecificStructure')?.value;

    if (!toggle) {
      this.assignService.clearStructureValidators(this.uiStructure);
    }

    const structure = toggle
      ? this.assignService.buildAssignedStructure(this.uiStructure.getRawValue(), this.model())
      : {
          organzationId: '',
          company: [],
        };

    const payload = this.buildPayload(toggle, structure);

    if (this.model()) {
      this.updateRole(payload);
    } else {
      this.createRole(payload);
    }
  }

  //-------build Structure -------
  get uiStructure(): FormGroup {
    return this.roleForm.get('uiStructure') as FormGroup;
  }

  get disabledForm() {
    return this.uiStructure.get('assignForSpecificStructure')?.value && this.uiStructure.invalid;
  }

  get isDisabled(): boolean {
    const name = this.roleForm.get('name');
    const roleCode = this.roleForm.get('roleCode');
    const parentRoleId = this.roleForm.get('parentRoleId');
    return !(name?.valid && roleCode?.valid && parentRoleId?.valid);
  }

  goToStep(step: number): void {
    if (step === 2) {
      if (this.isDisabled) return;
    }
    if (step < this.currentStep()) {
      this.currentStep.set(step);
    } else if (step > this.currentStep()) {
      this.completedSteps.update((step) => {
        step[this.currentStep() - 1] = true;
        return [...step];
      });
      this.currentStep.set(step);
    }
  }

  goBack() {
    this.currentStep.update((value) => value - 1);
  }

  resetStepperState(): void {
    this.currentStep.set(1);
    this.completedSteps.set([false, false]);
  }

  resetForm(): void {
    this.roleForm.reset({
      name: null,
      description: null,
      roleCode: null,
      parentRoleId: null,
      roleCopierFeatureId: null,
      isActive: false,
      uiStructure: {
        assignForSpecificStructure: false,
        selectedCompanies: [],
        selectedBranches: [],
        selectedDepartments: [],
        selectedTeams: [],
      },
    });
  }

  createRole(payload: any) {
    this.roleservice.createRole(payload).subscribe({
      next: () => {
        this.toasterService.addToast(
          ToastType.SUCCESS,
          this.localizationService.instant('hello'),
          '',
          {},
          true,
          false,
        );
        this.showSuccess.set(true);
      },
      error: () => {},
      complete: () => {
        this.closeSidebar();
      },
    });
  }

  updateRole(payload: any) {
    console.log(payload);
    this.roleservice.updateRole(payload).subscribe({
      next: () => {        
        this.toasterService.addToast(
          ToastType.SUCCESS,
          this.localizationService.instant('hello'),
          '',
          {},
          true,
          false,
        );
        this.showSuccess.set(true);
      },
      error: () => {},
      complete: () => {
        this.closeSidebar();
      },
    });
  }

  private buildPayload(toggle: boolean, structure: any) {
    const raw = this.roleForm.getRawValue();

    const payload = {
      ...(this.model() && {
        id: this.model().id,
      }),

      name: raw.name,
      description: raw.description,
      roleCode: raw.roleCode,
      parentRoleId: [raw.parentRoleId],
      roleCopierFeatureId: raw.roleCopierFeatureId,
      isActive: raw.isActive,
      isAssigneStructure: toggle,
      assigneStructure: structure,
    };

    return payload;
  }

  closeSidebar(): void {
    this.roleForm.reset();
    this.showSuccess.set(false);
    this.closeDialog.emit();
    this.resetStepperState();
  }
}
