import { afterNextRender, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssignationService } from '../../../shared/service/assignation-service';
import { MultiSelectComponent } from '../../../shared/components/primeng/multi-select/multi-select';
import { DropdownComponent } from '../../../shared/components/primeng/drop-down/drop-down';
import { ButtonComponent } from "../../../shared/components/primeng/button/button";
import { EmployeeCreationService } from '../../service/employee-creation-service';
import { OrganizationalStructure } from '../../model/employee-creation';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'hexa-assignation-information',
  imports: [ReactiveFormsModule, MultiSelectComponent,TranslatePipe, DropdownComponent, ButtonComponent],
  templateUrl: './assignation-information.html',
  styleUrl: './assignation-information.scss',
})
export class AssignationInformation {
  assignationForm = input.required<FormGroup>();
  private employeeCreationService = inject(EmployeeCreationService);
  createRoleFn = input.required<(isMain?: boolean) => FormGroup>();
  initialAssignation = input<any>(null);
  private currentLevel: string = 'Team';
  private appliedInitialData = false;
  private structureLoaded = signal(false);  
  private destroyRef = inject(DestroyRef);

   constructor() {
    effect(() => {
      const data = this.initialAssignation();
      const loaded = this.structureLoaded();
      if (data && loaded && !this.appliedInitialData) {
        this.appliedInitialData = true;
        this.applyInitialAssignation(data);
      }
    });
  }
  private readonly roleHierarchy: Record<string, number> = {
    Organization: 4,
    Company: 3,
    Branch: 2,
    Department: 1,
    Team: 0,
  };  

  companiesOptions: any[] = [];
  branchsOptions: any[] = [];
  departmentOptions: any[] = [];
  teamOptions: any[] = [];
  systemRolesOptions: any[] = [];
  customRolesOptions: any[] = [];
  
  branchsFilteredOptions: any[] = [];
  departmentFilteredOptions: any[] = [];
  teamFilteredOptions: any[] = [];

  roleTypes = [
  { label: 'System role', value: true },
  { label: 'Custom role', value: false }
  ];

   ngOnInit(): void {
    this.loadStructure();
  }

  private loadStructure(): void {
    this.employeeCreationService.getOrganizationalStructure().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: OrganizationalStructure) => {        
        this.companiesOptions = res.companies ?? [];
        this.branchsOptions = res.branches ?? [];
        this.departmentOptions = res.departments ?? [];
        this.teamOptions = res.teams ?? [];
        this.currentLevel = res.currentLevel ?? 'Team';
        this.structureLoaded.set(true);
      },
    });
  }

  getScopeLevel(): number {
    return this.roleHierarchy[this.currentLevel] ?? 0;
  }

  // ----------- Cascade handlers -----------

  onCompanyChange(selectedCompanyIds: string[]): void {
    this.branchsFilteredOptions = this.branchsOptions.filter((b) =>
      selectedCompanyIds?.includes(b.companyId)
    );
    this.departmentFilteredOptions = [];
    this.teamFilteredOptions = [];

    this.assignationForm().patchValue({
      branch: [],
      department: [],
      team: [],
    });
  }

  onBranchChange(selectedBranchIds: string[]): void {    
    this.departmentFilteredOptions = this.departmentOptions.filter((d) =>
      selectedBranchIds?.includes(d.branchId)
    );
    this.teamFilteredOptions = [];

    this.assignationForm().patchValue({
      department: [],
      team: [],
    });
  }

  onDepartmentChange(selectedDeptIds: string[]): void {
    this.teamFilteredOptions = this.teamOptions.filter((t) =>
      selectedDeptIds?.includes(t.departmentId)
    );

    this.assignationForm().patchValue({
      team: [],
    });
  }

onTeamChange(selectedTeamIds: string[]): void {
  if (!selectedTeamIds?.length) {
    this.systemRolesOptions = [];
    this.customRolesOptions = [];
    this.resetAllRoleTypeSelections();
    return;
  }

  this.employeeCreationService.getSystemAndCustomRoles(selectedTeamIds).subscribe({
    next: (res) => {
      this.systemRolesOptions = (res?.getAllSystemRoles ?? []).map((role: any) => ({
        id: role.id,
        name: role.name,
      }));

      this.customRolesOptions = (res?.getAllCoustemRoles ?? []).map((role: any) => ({
        id: role.roleId,
        name: role.roleName,
        teams: role.teams,
      }));
      this.resetAllRoleTypeSelections();
    },
  });
}

private resetAllRoleTypeSelections(): void {
  this.rolesArray.controls.forEach((control) => {
    const row = control as FormGroup;

    row.get('isSystemRole')?.reset();
    row.get('roleOptions')?.setValue([]);
    row.get('roleId')?.reset();
    row.get('mainHeadHierarchy')?.reset();
    row.get('headHierarchy')?.reset([]);
    row.get('headOptions')?.setValue([]);
    row.get('headValueField')?.setValue('');
  });
}

get rolesArray(): FormArray {
    return this.assignationForm().get('roles') as FormArray;
}

onRoleTypeChanged(isSystem: boolean, index: number): void {
  const row = this.rolesArray.at(index) as FormGroup;

  const roles = isSystem
    ? this.systemRolesOptions
    : this.customRolesOptions;

  row.get('roleOptions')?.setValue(roles);

  // Reset dependent fields
  row.get('roleId')?.reset();
  row.get('mainHeadHierarchy')?.reset();
  row.get('headHierarchy')?.reset([]);

  row.get('headOptions')?.setValue([]);
  row.get('headValueField')?.setValue('');
}


private getCustomRoleHeadOptions(selectedRole: any): any[] {
  const allowedTeams = this.teamOptions.filter((team: any) =>
    selectedRole.teams?.includes(team.teamId)
  );

  const allowedDepartments = this.departmentOptions.filter((department: any) =>
    allowedTeams.some(
      (team: any) => team.departmentId === department.departmentId
    )
  );

  const allowedBranches = this.branchsOptions.filter((branch: any) =>
    allowedDepartments.some(
      (department: any) => department.branchId === branch.branchId
    )
  );

  const allowedCompanies = this.companiesOptions.filter((company: any) =>
    allowedBranches.some(
      (branch: any) => branch.companyId === company.companyId
    )
  );

  return [
    ...allowedTeams.map((team: any) => ({
      id: team.teamId,
      name: team.name,
    })),

    ...allowedDepartments.map((department: any) => ({
      id: department.departmentId,
      name: department.name,
    })),

    ...allowedBranches.map((branch: any) => ({
      id: branch.branchId,
      name: branch.name,
    })),

    ...allowedCompanies.map((company: any) => ({
      id: company.companyId,
      name: company.name,
    })),
  ];
}

onRoleChanged(roleId: string, index: number): void {
  const row = this.rolesArray.at(index) as FormGroup;

  const isSystemRole = row.get('isSystemRole')?.value;
  const roleOptions = row.get('roleOptions')?.value ?? [];

  const selectedRole = roleOptions.find(
    (role: any) => role.id === roleId
  );

  if (!selectedRole) {
    return;
  }

  // Reset hierarchy selections
  row.get('mainHeadHierarchy')?.reset();
  row.get('headHierarchy')?.reset([]);

  if (isSystemRole === false) {
    const headOptions = this.getCustomRoleHeadOptions(selectedRole);

    row.get('headOptions')?.setValue(headOptions);
    row.get('headValueField')?.setValue('id');    
    return;
  }


  const roleName = (selectedRole.name ?? '').toLowerCase();
  if (roleName.includes('company')) {
    row.get('headOptions')?.setValue(this.companiesOptions);
    row.get('headValueField')?.setValue('companyId');

  } else if (roleName.includes('branch')) {
    row.get('headOptions')?.setValue(this.branchsFilteredOptions);
    row.get('headValueField')?.setValue('branchId');

  } else if (roleName.includes('department')) {
    row.get('headOptions')?.setValue(this.departmentFilteredOptions);
    row.get('headValueField')?.setValue('departmentId');

  } else if (roleName.includes('team')) {
    row.get('headOptions')?.setValue(this.teamFilteredOptions);
    row.get('headValueField')?.setValue('teamId');

  } else {
    row.get('headOptions')?.setValue([]);
    row.get('headValueField')?.setValue('');
  }
}


getFilteredHeadOptions(index: number): any[] {
  const row = this.rolesArray.at(index) as FormGroup;

  const all = row.get('headOptions')?.value || [];
  const selectedMain = row.get('mainHeadHierarchy')?.value;
  const valueField = row.get('headValueField')?.value;

  return all.filter(
    (item: any) => item[valueField] !== selectedMain
  );
}

onMainHeadChanged(selectedMainId: string, index: number): void {
  const row = this.rolesArray.at(index) as FormGroup;

  const selectedMore = row.get('headHierarchy')?.value ?? [];

  row.get('headHierarchy')?.setValue(
    selectedMore.filter((id: string) => id !== selectedMainId)
  );
}


setDefaultRole(selectedIndex: number): void {
  this.rolesArray.controls.forEach((control, index) => {
    const isSelected = index === selectedIndex;
    control.get('isMainRole')?.setValue(isSelected);

    const mainHeadControl = control.get('mainHeadHierarchy');
    if (isSelected) {
      mainHeadControl?.setValidators([Validators.required]);
    } else {
      mainHeadControl?.clearValidators();
    }
    mainHeadControl?.updateValueAndValidity();
  });
}

  // ============ Array management ============
addRole(): void {
  this.rolesArray.push(this.createRoleFn()());
}

removeRole(index: number): void {
  const removedControl = this.rolesArray.at(index);
  const wasMain = removedControl?.get('isMainRole')?.value === true;

  this.rolesArray.removeAt(index);

  if (wasMain && this.rolesArray.length > 0) {
    const newMainControl = this.rolesArray.at(0);
    newMainControl.get('isMainRole')?.setValue(true);

    const mainHeadControl = newMainControl.get('mainHeadHierarchy');
    mainHeadControl?.setValidators([Validators.required]);
    mainHeadControl?.updateValueAndValidity();
  }
}


buildAssignmentPayload(): any {
  const raw = this.assignationForm().getRawValue();
  const organizationId = this.companiesOptions[0]?.organizationId ?? '';

  return {
    assigneStructure: this.buildStructure(raw, organizationId),
    roles: this.buildRoles(raw.roles),
  };
}



private buildStructure(raw: any, organizationId: string): any {
  const companyPayload = (raw.company || []).map((cId: string) => {
    const branchesForThisCompany = (raw.branch || [])
      .filter((bId: string) => {
        const branchOpt = this.branchsOptions.find((opt: any) => opt.branchId === bId);
        return branchOpt?.companyId === cId;
      })
      .map((bId: string) => {
        const deptsForThisBranch = (raw.department || [])
          .filter((dId: string) => {
            const deptOpt = this.departmentOptions.find((opt: any) => opt.departmentId === dId);
            return deptOpt?.branchId === bId;
          })
          .map((dId: string) => {
            const teamsForThisDept = (raw.team || [])
              .filter((tId: string) => {
                const teamOpt = this.teamOptions.find((opt: any) => opt.teamId === tId);
                return teamOpt?.departmentId === dId;
              });

            return {
              id: dId,
              teamId: teamsForThisDept,
            };
          });

        return {
          id: bId,
          departments: deptsForThisBranch,
        };
      });

    return {
      id: cId,
      branches: branchesForThisCompany,
    };
  });

  return {
    organzationId: organizationId,
    company: companyPayload,
  };
}

private buildRoles(roles: any[]): any[] {
  if (!Array.isArray(roles)) return [];

  return roles.map((r: any) => {
    const hierarchies: any[] = [];
    const localOptions = r.headOptions || [];
    const valueField = r.headValueField;

    const getNameFromId = (id: string): string => {
      if (!id || !valueField || localOptions.length === 0) return '';
      const option = localOptions.find((o: any) => o[valueField] === id);
      return option?.name || '';
    };

    if (r.mainHeadHierarchy) {
      hierarchies.push({
        headHierarchyId: r.mainHeadHierarchy,
        headHierarchyName: getNameFromId(r.mainHeadHierarchy),
        isMainHierarchy: true,
      });
    }

    if (Array.isArray(r.headHierarchy)) {
      r.headHierarchy.forEach((hhId: any) => {
        if (!r.mainHeadHierarchy || hhId !== r.mainHeadHierarchy) {
          hierarchies.push({
            headHierarchyId: hhId,
            headHierarchyName: getNameFromId(hhId),
            isMainHierarchy: false,
          });
        }
      });
    }

    return {
      roleId: r.roleId,
      isMainRole: r.isMainRole,
      isSystemRole: r.isSystemRole,
      hierarchies,
    };
  });
 }


  private applyInitialAssignation(data: any): void {
    const structure = data.assigneStructure ?? {};
    const companyIds = (structure.companies ?? []).map((c: any) => c.companyId);
    const branchIds = (structure.branches ?? []).map((b: any) => b.branchId);
    const departmentIds = (structure.departments ?? []).map((d: any) => d.departmentId);
    const teamIds = (structure.teams ?? []).map((t: any) => t.teamId);

    // نبني الـ filtered options زي ما بيحصل بالظبط لما اليوزر يختار يدوي
    this.branchsFilteredOptions = this.branchsOptions.filter((b) => companyIds.includes(b.companyId));
    this.departmentFilteredOptions = this.departmentOptions.filter((d) => branchIds.includes(d.branchId));
    this.teamFilteredOptions = this.teamOptions.filter((t) => departmentIds.includes(t.departmentId));

    this.assignationForm().patchValue({
      company: companyIds,
      branch: branchIds,
      department: departmentIds,
      team: teamIds,
    });

    // نجيب اختيارات الرولز (system/custom) بناءً على الفرق دلوقتي
    if (teamIds.length) {
      this.employeeCreationService.getSystemAndCustomRoles(teamIds).subscribe({
        next: (res) => {
          this.systemRolesOptions = (res?.getAllSystemRoles ?? []).map((r: any) => ({ id: r.id, name: r.name }));
          this.customRolesOptions = (res?.getAllCoustemRoles ?? []).map((r: any) => ({
            id: r.roleId,
            name: r.roleName,
            teams: r.teams,
          }));
          this.applyRoles(data.roles ?? []);
        },
        error: (err) => {
          this.applyRoles(data.roles ?? []); // نكمل بدون roleOptions لو فشل
        },
      });
    } else {
      this.applyRoles(data.roles ?? []);
    }
  }

  private applyRoles(roles: any[]): void {
    if (!roles.length) return;

    // نفضي الـ array الافتراضي (اللي فيه صف واحد فاضي) ونبنيه من جديد
    this.rolesArray.clear();

    roles.forEach((role: any) => {
      const group = this.createRoleFn()(role.mainRole);
      this.rolesArray.push(group);
      const index = this.rolesArray.length - 1;

      const roleOptions = role.isSystemRole ? this.systemRolesOptions : this.customRolesOptions;
      group.patchValue({ roleOptions });

      const selectedRole = roleOptions.find((r: any) => r.id === role.roleId);

      // نحدد headOptions وheadValueField بنفس منطق onRoleChanged بس من غير ريست
      let headOptions: any[] = [];
      let headValueField = '';

      if (selectedRole) {
        if (!role.isSystemRole) {
          headOptions = this.getCustomRoleHeadOptionsPublic(selectedRole);
          headValueField = 'id';
        } else {
          const roleName = (selectedRole.name ?? '').toLowerCase();
          if (roleName.includes('company')) {
            headOptions = this.companiesOptions;
            headValueField = 'companyId';
          } else if (roleName.includes('branch')) {
            headOptions = this.branchsFilteredOptions;
            headValueField = 'branchId';
          } else if (roleName.includes('department')) {
            headOptions = this.departmentFilteredOptions;
            headValueField = 'departmentId';
          } else if (roleName.includes('team')) {
            headOptions = this.teamFilteredOptions;
            headValueField = 'teamId';
          }
        }
      }

      const mainHierarchy = (role.hierarchies ?? []).find((h: any) => h.isMainHierarchy);
      const extraHierarchies = (role.hierarchies ?? [])
        .filter((h: any) => !h.isMainHierarchy)
        .map((h: any) => h.headHierarchyId);

      group.patchValue({
        isSystemRole: role.isSystemRole,
        roleId: role.roleId,
        isMainRole: role.mainRole,
        mainHeadHierarchy: mainHierarchy?.headHierarchyId ?? '',
        headHierarchy: extraHierarchies,
        headOptions,
        headValueField,
      });
    });
  }

  private getCustomRoleHeadOptionsPublic(selectedRole: any): any[] {
    return this.getCustomRoleHeadOptions(selectedRole);
  }

  get isTeamSelected(): boolean {
  return (this.assignationForm().get('team')?.value ?? []).length > 0;
  }

}
