import { Component, inject, input, OnInit, output, signal } from '@angular/core';
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
export class ManualRole implements OnInit {
  visible = input<boolean>(false);
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

  getAllParentRole(): void {
    this.roleservice.getAllParentRoles().subscribe({
      next: (res) => {
        this.parentRolesOptions.set(res);
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
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  onStepChange(event: any): void {}

  submit() {
    this.createRole();
    console.log(this.roleForm.value);
  }

    //-------build Structure -------
  get uiStructure(): FormGroup {
    return this.roleForm.get('uiStructure') as FormGroup;
  }

  get disabledForm() {
    return (
      this.uiStructure.get('assignForSpecificStructure')?.value &&
      this.uiStructure.invalid
    );
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
      this.completedSteps.update(step => {
        step[this.currentStep() - 1] = true;
        return [...step]
      })
      this.currentStep.set(step);
    }
  }

   goBack() {
    this.currentStep.update(value => value - 1);
  }

  resetStepperState(): void {
  this.currentStep.set(1);
  this.completedSteps.set([false, false]);
  }

  createRole(){
    this.pageStatus = ApiStatus.Loading;
     const formValue = this.roleForm.value;
     const payload = {
        ...formValue,
        parentRoleId: formValue.parentRoleId ? [formValue.parentRoleId] : [],
      };
    this.roleservice.createRole(payload).subscribe({
      next:()=>{
        this.toasterService.addToast(
          ToastType.SUCCESS,
          this.localizationService.instant(
            'hello',
          ),
          '',
          {},
          true,
          false,
        );
        this.showSuccess.set(true);
      },
      error:()=>{},
      complete:()=>{
        this.closeSidebar();
      },
    })
  }

  closeSidebar(): void {
    this.roleForm.reset();
    this.showSuccess.set(false);
    this.closeDialog.emit();
    this.resetStepperState();
  }




}
