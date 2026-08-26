
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { XhrService } from '../API/xhr/xhr';
import { HttpMethod } from '../../models/enums/http-method';

@Injectable({
  providedIn: 'root',
})
export class AssignStructure {
   constructor(private xhrService: XhrService) {}
  private structureCache$: Observable<any> | null = null;

  organizationalStructure: any = null;
  roleLevel: string = '';
  loadingStructure = false;

  getOrganizationalStructure(): Observable<any> {
    if (!this.structureCache$) {
      this.structureCache$ = this.xhrService
        .call({
          method: HttpMethod.Get,
          url: `RoleScope/Get/Roleid`,
        })
        .pipe(shareReplay(1));
    }
    return this.structureCache$;
  }

  loadStructureData(uiStructure: FormGroup, model: any | null): void {
    if (this.organizationalStructure) {
      if (model?.getScopes) {
        this.fillStructureFromBackend(uiStructure, model.getScopes);
        this.roleLevel = model.getScopes.currentLevel || this.roleLevel;
      }
      return;
    }

    this.loadingStructure = true;
    this.getOrganizationalStructure()?.subscribe({
      next: (data) => {
        this.organizationalStructure = data;
        this.roleLevel = data.currentLevel || 'Organization';

        if (model?.getScopes) {
          this.fillStructureFromBackend(uiStructure, model.getScopes);
          this.roleLevel = model.getScopes.currentLevel || this.roleLevel;
        }
      },
      complete: () => (this.loadingStructure = false),
      error: () => (this.loadingStructure = false),
    });
  }

  private fillStructureFromBackend(uiStructure: FormGroup, scopes: any): void {
    const allCompanyIds = (scopes.companies || []).map((c: any) => c.companyId);
    const allBranchIds = (scopes.branches || []).map((b: any) => b.branchId);
    const allDeptIds = (scopes.departments || []).map(
      (d: any) => d.departmentId,
    );
    const allTeamIds = (scopes.teams || []).map((t: any) => t.teamId);

    uiStructure.patchValue({
      assignForSpecificStructure: true,
      selectedCompanies: allCompanyIds,
      selectedBranches: allBranchIds,
      selectedDepartments: allDeptIds,
      selectedTeams: allTeamIds,
    });
  }

  buildAssignedStructure(formValue: any, model: any | null): any {
    const organizationalData = this.organizationalStructure;

    const {
      selectedCompanies,
      selectedBranches,
      selectedDepartments,
      selectedTeams,
    } = formValue;
    const allCompanies = organizationalData?.companies || [];
    const allBranches = organizationalData?.branches || [];
    const allDepartments = organizationalData?.departments || [];
    const allTeams = organizationalData?.teams || [];

    const visibleCompanyIds = allCompanies.map((c: any) => c.companyId);

    // Part 1: Build the structure based on current user selections
    const builtCompanies = selectedCompanies
      .filter((id: any) => visibleCompanyIds.includes(id))
      .map((companyId: any) => {
        const branchesOfCompany = allBranches.filter(
          (b: any) => b.companyId === companyId,
        );
        const branchesToSend = selectedBranches.length
          ? branchesOfCompany.filter((b: any) =>
              selectedBranches.includes(b.branchId),
            )
          : branchesOfCompany;

        const branchStructures = branchesToSend.map((branch: any) => {
          const departmentsOfBranch = allDepartments.filter(
            (d: any) => d.branchId === branch.branchId,
          );
          const departmentsToSend = selectedDepartments.length
            ? departmentsOfBranch.filter((d: any) =>
                selectedDepartments.includes(d.departmentId),
              )
            : departmentsOfBranch;

          const departmentStructures = departmentsToSend.map((dept: any) => {
            const teamsOfDept = allTeams.filter(
              (t: any) => t.departmentId === dept.departmentId,
            );
            const teamsToSend = selectedTeams.length
              ? teamsOfDept.filter((t: any) => selectedTeams.includes(t.teamId))
              : teamsOfDept;
            return {
              id: dept.departmentId,
              teamId: teamsToSend.map((t: any) => t.teamId),
            };
          });

          return { id: branch.branchId, departments: departmentStructures };
        });

        return { id: companyId, branches: branchStructures };
      });

    // Part 2: Merge hidden/historical scopes that are not in the current visible list
    const getScopes = model?.getScopes;
    const hiddenCompanyIds = (getScopes?.companies || [])
      .map((c: any) => c.companyId)
      .filter((id: any) => !visibleCompanyIds.includes(id));

    const hiddenCompanies = hiddenCompanyIds.map((companyId: any) => {
      const branches = (getScopes?.branches || []).filter(
        (b: any) => b.companyId === companyId,
      );
      const branchStructures = branches.map((branch: any) => {
        const departments = (getScopes?.departments || []).filter(
          (d: any) => d.branchId === branch.branchId,
        );
        const departmentStructures = departments.map((dept: any) => {
          const teams = (getScopes?.teams || []).filter(
            (t: any) => t.departmentId === dept.departmentId,
          );
          return {
            id: dept.departmentId,
            teamId: teams.map((t: any) => t.teamId),
          };
        });
        return { id: branch.branchId, departments: departmentStructures };
      });
      return { id: companyId, branches: branchStructures };
    });

    // Combine both visible and hidden structures
    return {
      organzationId:
        organizationalData?.companies?.[0]?.organizationId ??
        getScopes?.companies?.[0]?.organizationId ??
        '',
      company: [...builtCompanies, ...hiddenCompanies],
    };
  }

  clearStructureValidators(uiStructure: FormGroup): void {
    [
      'selectedCompanies',
      'selectedBranches',
      'selectedDepartments',
      'selectedTeams',
    ].forEach((field) => {
      const ctrl = uiStructure.get(field);
      ctrl?.clearValidators();
      ctrl?.setErrors(null);
      ctrl?.updateValueAndValidity({ emitEvent: false });
    });

    uiStructure.clearValidators();
    uiStructure.updateValueAndValidity({ emitEvent: false });
  }

  clearCache(): void {
    this.structureCache$ = null;
    this.organizationalStructure = null;
    this.roleLevel = '';
  }
}
