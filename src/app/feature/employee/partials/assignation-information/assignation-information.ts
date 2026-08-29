import { Component, inject, input } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AssignationService, OrganizationalStructure } from '../../../shared/service/assignation-service';
import { MultiSelectComponent } from '../../../shared/components/primeng/multi-select/multi-select';
import { DropdownComponent } from '../../../shared/components/primeng/drop-down/drop-down';

@Component({
  selector: 'hexa-assignation-information',
  imports: [ReactiveFormsModule , MultiSelectComponent , DropdownComponent],
  templateUrl: './assignation-information.html',
  styleUrl: './assignation-information.scss',
})
export class AssignationInformation {
  assignationForm = input.required<FormGroup>();
  private assignationService = inject(AssignationService);

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
    this.assignationService.getOrganizationalStructure().subscribe({
      next: (res: OrganizationalStructure) => {
        console.log(res , 'structure');
        
        this.companiesOptions = res.companies ?? [];
         console.log(this.companiesOptions , 'this.companiesOptions');
        this.branchsOptions = res.branches ?? [];
        this.departmentOptions = res.departments ?? [];
        this.teamOptions = res.teams ?? [];
      },
      error: (err) => console.error('Error loading organizational structure', err),
    });
  }


  // ----------- Cascade handlers -----------

  onCompanyChange(selectedCompanyIds: string[]): void {
    console.log(selectedCompanyIds);
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
    console.log(selectedBranchIds);
    
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
    return;
  }

  this.assignationService.getSystemAndCustomRoles(selectedTeamIds).subscribe({
    next: (res) => {
      console.log('roles response:', res);

      this.systemRolesOptions = (res?.getAllSystemRoles ?? []).map((role: any) => ({
        id: role.id,
        name: role.name,
      }));

      this.customRolesOptions = (res?.getAllCoustemRoles ?? []).map((role: any) => ({
        id: role.roleId,
        name: role.roleName,
        teams: role.teams,
      }));
    },

    error: (err) => {
      console.error('Error loading roles', err);
    }
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

  // System Role - هنكملها في الخطوة التالية
}

}
