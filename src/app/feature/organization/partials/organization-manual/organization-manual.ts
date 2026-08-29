import { OrganizationLogic } from './../../services/organization-logic';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {  TranslatePipe } from '@ngx-translate/core';

import { DrawerModule } from 'primeng/drawer';
import { BranchCreate, CompanyCreate, DepartmentCreate, HierarchySteps, TeamCreate } from '../../models/organization-creation.model';
import { Organization } from '../../services/organization';
import { ToastService } from '../../../../core/services/toast/toast';
import { Localization } from '../../../../core/services/localization/localization';
import { AssignStructure } from '../../../../core/services/assign-structure/assign-structure';
import { ToastType } from '../../../../core/models/enums/toast-type';
import { CompanyManual } from '../company-manual/company-manual';
import { BranchManual } from '../branch-manual/branch-manual';
import { DepartmentManual } from '../department-manual/department-manual';
import { TeamManual } from '../team-manual/team-manual';

@Component({
  selector: 'app-organization-manual',
   imports: [
    CommonModule,
    TranslatePipe,
    DrawerModule,
    CompanyManual,
    BranchManual,
    DepartmentManual,
    TeamManual
  ],
  templateUrl: './organization-manual.html',
  styleUrl: './organization-manual.scss',
})
export class OrganizationManual {
constructor(
  private readonly organizationLogicService:OrganizationLogic,
  private readonly organizationService:Organization,
  private readonly toastService:ToastService,
  private readonly localizationService:Localization,
  private readonly assignService:AssignStructure,
  private readonly destroyRef:DestroyRef,
){}
  hierarchySteps = HierarchySteps;

  /* -------------------- inputs / outputs -------------------- */
  visible = input<boolean>(false);
  close = output<boolean>();
  onSave = output<boolean>();

  /* -------------------- state (signals) -------------------- */
  showSuccess = signal<boolean>(false);
  company = signal<CompanyCreate | null>(null);
  branch = signal<BranchCreate | null>(null);
  department = signal<DepartmentCreate | null>(null);
  team = signal<TeamCreate | null>(null);
  currentStep = signal<number | null>(null);
  startPoint = signal<number | null>(null);
  id = signal<string | null>(null);

  private payload: CompanyCreate | BranchCreate | DepartmentCreate | TeamCreate | null = null;

  sideBarTitle = computed(() => this.getSidebarTitle(this.currentStep()).title);
  sideBarSubTitle = computed(() => this.getSidebarTitle(this.currentStep()).subtitle);

  ngOnInit(): void {
    this.organizationLogicService.start$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => this.startPoint.set(res));

    this.organizationLogicService.currentStep$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => this.currentStep.set(res));

    this.organizationLogicService.id$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => this.id.set(id));
  }

  private getSidebarTitle(current: number | null): { title: string; subtitle: string } {
    if (current == 1) {
      return { title: 'organization.company.home.title', subtitle: 'organization.company.home.subtitle' };
    } else if (current == 2) {
      return { title: 'organization.branch.home.title', subtitle: 'organization.branch.home.subtitle' };
    } else if (current == 3) {
      return { title: 'organization.department.home.title', subtitle: 'organization.department.home.subtitle' };
    }
    return { title: 'organization.team.home.title', subtitle: 'organization.team.home.subtitle' };
  }

  onSubmit(): void {
    const company = this.company();
    const branch = this.branch();
    const department = this.department();
    const team = this.team();

    switch (this.startPoint()) {
      case HierarchySteps.Company:
        if (!company) return;
        company.createBranch = Object.assign(new BranchCreate(), branch);
        company.createBranch.createDepartment = Object.assign(new DepartmentCreate(), department);
        company.createBranch.createDepartment.createTeam = Object.assign(new TeamCreate(), team);
        this.payload = company;
        break;
      case HierarchySteps.Branch:
        if (!branch) return;
        branch.createDepartment = Object.assign(new DepartmentCreate(), department);
        branch.createDepartment.createTeam = Object.assign(new TeamCreate(), team);
        this.payload = branch;
        break;
      case HierarchySteps.Department:
        if (!department) return;
        department.createTeam = Object.assign(new TeamCreate(), team);
        this.payload = department;
        break;
      case HierarchySteps.Team:
        this.payload = team;
        break;
    }
    if (this.payload) {
      this.submitOrganizationData(this.payload);
    }
  }

  closeSidebar() {
    this.close.emit(false);
    this.organizationLogicService.setId(null);
  }

  goNext(request: any) {
    switch (this.currentStep()) {
      case HierarchySteps.Company:
        this.company.set(Object.assign(new CompanyCreate(), request));
        break;
      case HierarchySteps.Branch:
        this.branch.set(Object.assign(new BranchCreate(), request));
        break;
      case HierarchySteps.Department:
        this.department.set(Object.assign(new DepartmentCreate(), request));
        break;
      case HierarchySteps.Team:
        this.team.set(Object.assign(new TeamCreate(), request));
        this.onSubmit();
        return;
      default:
        break;
    }
    this.organizationLogicService.goNext();
  }

  onSkipAndSave(event: boolean): void {
    if (!event) {
      this.closeSidebar();
      return;
    }

    const startPoint = this.startPoint();
    const currentStep = this.currentStep();
    if (startPoint === null || currentStep === null) return;

    const stopAt = currentStep - 1;
    const company = this.company();
    const branch = this.branch();
    const department = this.department();
    const team = this.team();

    let payload: CompanyCreate | BranchCreate | DepartmentCreate | TeamCreate | null = null;

    // ============ COMPANY ============
    if (startPoint === HierarchySteps.Company && company) {
      if (stopAt >= HierarchySteps.Branch && branch) {
        company.createBranch = branch;

        if (stopAt >= HierarchySteps.Department && department) {
          company.createBranch.createDepartment = department;

          if (stopAt >= HierarchySteps.Team && team) {
            company.createBranch.createDepartment.createTeam = team;
          }
        }
      }
      payload = company;
    }
    // ============ BRANCH ============
    else if (startPoint === HierarchySteps.Branch && branch) {
      if (stopAt >= HierarchySteps.Department && department) {
        branch.createDepartment = department;

        if (stopAt >= HierarchySteps.Team && team) {
          branch.createDepartment.createTeam = team;
        }
      }
      payload = branch;
    }
    // ============ DEPARTMENT ============
    else if (startPoint === HierarchySteps.Department && department) {
      if (stopAt >= HierarchySteps.Team && team) {
        department.createTeam = team;
      }
      payload = department;
    }
    // ============ TEAM ============
    else if (startPoint === HierarchySteps.Team && team) {
      payload = team;
    }

    if (!payload) return;
    this.submitOrganizationData(payload);
  }

  submitOrganizationData(payload: CompanyCreate | BranchCreate | DepartmentCreate | TeamCreate): void {
    const request = this.checkParent(payload);
    this.organizationService.saveOrganizationData(request).subscribe({
      next: () => {
        this.toastService.addToast(
          ToastType.SUCCESS,
          this.getCreateMessage(),
          '',
          {},
          true,
          false
        );
        this.assignService.clearCache();
        this.showSuccess.set(true);
      },
      complete: () => {
        setTimeout(() => {
          this.onSave.emit(true);
          this.showSuccess.set(false);
          this.closeSidebar();
        }, 2000);
      }
    });
  }

  checkParent(payload: CompanyCreate | BranchCreate | DepartmentCreate | TeamCreate): any {
    switch (this.startPoint()) {
      case HierarchySteps.Company:
        return { company: payload };
      case HierarchySteps.Branch:
        return { branch: payload };
      case HierarchySteps.Department:
        return { department: payload };
      case HierarchySteps.Team:
        return { team: payload };
      default:
        break;
    }
  }

  onUpdate(event: boolean) {
    if (event) {
      this.showSuccess.set(true);
      this.assignService.clearCache();
      setTimeout(() => {
        this.onSave.emit(true);
        this.closeSidebar();
        this.showSuccess.set(false);
      }, 2000);
    }
  }

  getCreateMessage(): string {
    const startPoint = this.startPoint();
    if (startPoint == 1) {
      return this.localizationService.instant('organization.company.home.createdMessage');
    } else if (startPoint == 2) {
      return this.localizationService.instant('organization.branch.home.createdMessage');
    } else if (startPoint == 3) {
      return this.localizationService.instant('organization.department.home.createdMessage');
    }
    return this.localizationService.instant('organization.team.home.createdMessage');
  }
}
