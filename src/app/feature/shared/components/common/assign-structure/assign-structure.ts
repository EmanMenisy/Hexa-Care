import { Component, OnChanges, SimpleChanges, input, output } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { MultiSelectComponent } from '../../primeng/multi-select/multi-select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';


@Component({
  selector: 'app-assign-structure',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    TranslatePipe,
    MultiSelectComponent,
    ToggleSwitchModule
  ],
  templateUrl: './assign-structure.html',
  styleUrls: ['./assign-structure.scss']
})
export class AssignStructureComponent implements OnChanges {

  // ============================================================
  // INPUTS
  // ============================================================

  formGroup = input.required<FormGroup>();

  organizationalData = input<any>(null);

  currentLevel = input<string>('Organization');

  loading = input<boolean>(false);

  isEdit = input<boolean>(false);

  scopes = input<any>(null);


  // ============================================================
  // OUTPUTS
  // ============================================================

  companyChange = output<string[]>();

  branchChange = output<string[]>();

  departmentChange = output<string[]>();

  teamsChange = output<string[]>();


  // ============================================================
  // DATA
  // ============================================================

  companyList: any[] = [];

  branchList: any[] = [];

  departmentList: any[] = [];

  teamsList: any[] = [];


  // ============================================================
  // DISABLE STATES
  // ============================================================

  disableCompany = false;

  disableBranch = false;

  disableDepartment = false;

  disableTeam = false;


  private loadedOnce = false;


  // ============================================================
  // LIFECYCLE
  // ============================================================

  ngOnChanges(changes: SimpleChanges): void {

    if (
      changes['organizationalData'] &&
      this.organizationalData()
    ) {

      this.prepareDropdownSources();

      this.disableBasedOnLevel();


      // ========================================================
      // EDIT MODE
      // ========================================================

      if (this.isEdit()) {

        if (!this.loadedOnce) {

          this.patchSelectedFromScopes();

          this.loadedOnce = true;
        }
      }


      // ========================================================
      // CREATE MODE
      // ========================================================

      if (!this.isEdit()) {

        this.applyRoleDefaults();
      }


      this.applyToggleValidation();

      this.formGroup().updateValueAndValidity({
        emitEvent: false
      });
    }
  }


  // ============================================================
  // VALIDATION
  // ============================================================

  private applyToggleValidation(): void {

    const toggle =
      this.formGroup()
        .get('assignForSpecificStructure')
        ?.value;

    const companyCtrl =
      this.formGroup()
        .get('selectedCompanies');


    // When toggle ON → Companies required

    if (toggle) {

      companyCtrl?.setValidators([
        Validators.required
      ]);

    } else {

      companyCtrl?.clearValidators();
    }


    companyCtrl?.updateValueAndValidity({
      emitEvent: false
    });


    // Others are always optional

    [
      'selectedBranches',
      'selectedDepartments',
      'selectedTeams'
    ].forEach((name) => {

      const control =
        this.formGroup().get(name);

      control?.clearValidators();

      control?.updateValueAndValidity({
        emitEvent: false
      });
    });
  }


  // ============================================================
  // PATCH EDIT DATA
  // ============================================================

  private patchSelectedFromScopes(): void {

    if (
      !this.isEdit() ||
      !this.scopes()
    ) {
      return;
    }


    const ui = this.formGroup();


    const selectedCompanies =
      (this.scopes().companies || [])
        .filter((x: any) => x.companyId)
        .map((x: any) => x.companyId);


    // Extract branchIds from both branches AND departments

    const branchesFromScope =
      (this.scopes().branches || [])
        .filter(
          (x: any) =>
            x.branchId &&
            x.companyId
        )
        .map(
          (x: any) =>
            x.branchId
        );


    const branchesFromDepts =
      (this.scopes().departments || [])
        .filter(
          (x: any) =>
            x.branchId
        )
        .map(
          (x: any) =>
            x.branchId
        );


    // Combine and deduplicate

    const selectedBranches = [
      ...new Set([
        ...branchesFromScope,
        ...branchesFromDepts
      ])
    ];


    const selectedDepartments =
      (this.scopes().departments || [])
        .filter(
          (x: any) =>
            x.departmentId &&
            x.branchId
        )
        .map(
          (x: any) =>
            x.departmentId
        );


    const selectedTeams =
      (this.scopes().teams || [])
        .filter(
          (x: any) =>
            x.teamId &&
            x.departmentId
        )
        .map(
          (x: any) =>
            x.teamId
        );


    ui.patchValue(
      {
        assignForSpecificStructure: true,
        selectedCompanies,
        selectedBranches,
        selectedDepartments,
        selectedTeams
      },
      {
        emitEvent: false
      }
    );
  }


  // ============================================================
  // BUILD OPTIONS
  // ============================================================

  private prepareDropdownSources(): void {

    const role =
      this.organizationalData() || {};

    const scope =
      this.isEdit()
        ? (this.scopes() || {})
        : {};


    const getUniqueList = (
      roleArr: any[],
      scopeArr: any[],
      idKey: string,
      parentKey?: string
    ) => {

      const combined = [
        ...(roleArr || []),
        ...(scopeArr || [])
      ];

      const uniqueMap = new Map();


      combined.forEach((item) => {

        const id =
          item[idKey];

        if (
          id &&
          (item.name || item.departmentName)
        ) {

          uniqueMap.set(
            id,
            {
              label:
                item.name ||
                item.departmentName,

              value: id,

              ...(parentKey
                ? {
                    parentId:
                      item[parentKey]
                  }
                : {})
            }
          );
        }
      });


      return Array.from(
        uniqueMap.values()
      );
    };


    this.companyList =
      getUniqueList(
        role.companies,
        scope.companies,
        'companyId'
      );


    this.branchList =
      getUniqueList(
        role.branches,
        scope.branches,
        'branchId',
        'companyId'
      );


    this.departmentList =
      getUniqueList(
        role.departments,
        scope.departments,
        'departmentId',
        'branchId'
      );


    this.teamsList =
      getUniqueList(
        role.teams,
        scope.teams,
        'teamId',
        'departmentId'
      );
  }


  // ============================================================
  // DEFAULTS FOR CREATE MODE
  // ============================================================

  private applyRoleDefaults(): void {

    const fg =
      this.formGroup();


    const companies =
      this.companyList.map(
        (x) => x.value
      );

    const branches =
      this.branchList.map(
        (x) => x.value
      );

    const departments =
      this.departmentList.map(
        (x) => x.value
      );

    const teams =
      this.teamsList.map(
        (x) => x.value
      );


    // Toggle on by default

    fg.patchValue({
      assignForSpecificStructure: true
    });


    switch (this.currentLevel()) {

      case 'Organization':

        // No auto-fill

        break;


      case 'Company':

        fg.patchValue({
          selectedCompanies:
            companies
        });

        break;


      case 'Branch':

        fg.patchValue({
          selectedCompanies:
            companies,

          selectedBranches:
            branches
        });

        break;


      case 'Department':

        fg.patchValue({
          selectedCompanies:
            companies,

          selectedBranches:
            branches,

          selectedDepartments:
            departments
        });

        break;


      case 'Team':

        fg.patchValue({
          selectedCompanies:
            companies,

          selectedBranches:
            branches,

          selectedDepartments:
            departments,

          selectedTeams:
            teams
        });

        break;
    }
  }


  // ============================================================
  // ENABLE / DISABLE LOGIC
  // ============================================================

  private disableBasedOnLevel(): void {

    const form =
      this.formGroup();


    const disable = (
      name: string
    ) => {

      form
        .get(name)
        ?.disable({
          emitEvent: false
        });
    };


    const enable = (
      name: string
    ) => {

      form
        .get(name)
        ?.enable({
          emitEvent: false
        });
    };


    // Reset all

    this.disableCompany = false;

    this.disableBranch = false;

    this.disableDepartment = false;

    this.disableTeam = false;


    switch (this.currentLevel()) {

      case 'Organization':

        enable('selectedCompanies');
        enable('selectedBranches');
        enable('selectedDepartments');
        enable('selectedTeams');

        break;


      case 'Company':

        disable('selectedCompanies');

        enable('selectedBranches');
        enable('selectedDepartments');
        enable('selectedTeams');

        this.disableCompany = true;

        break;


      case 'Branch':

        disable('selectedCompanies');
        disable('selectedBranches');

        enable('selectedDepartments');
        enable('selectedTeams');

        this.disableCompany = true;
        this.disableBranch = true;

        break;


      case 'Department':

        disable('selectedCompanies');
        disable('selectedBranches');
        disable('selectedDepartments');

        enable('selectedTeams');

        this.disableCompany = true;
        this.disableBranch = true;
        this.disableDepartment = true;

        break;


      case 'Team':

        disable('selectedCompanies');
        disable('selectedBranches');
        disable('selectedDepartments');
        disable('selectedTeams');

        this.disableCompany = true;
        this.disableBranch = true;
        this.disableDepartment = true;
        this.disableTeam = true;

        break;
    }
  }


  // ============================================================
  // SELECTED VALUES
  // ============================================================

  get selectedCompanies() {

    const val =
      this.formGroup()
        .get('selectedCompanies')
        ?.value || [];

    return val.map(
      (x: any) =>
        x?.value ?? x
    );
  }


  get selectedBranches() {

    const val =
      this.formGroup()
        .get('selectedBranches')
        ?.value || [];

    return val.map(
      (x: any) =>
        x?.value ?? x
    );
  }


  get selectedDepartments() {

    const val =
      this.formGroup()
        .get('selectedDepartments')
        ?.value || [];

    return val.map(
      (x: any) =>
        x?.value ?? x
    );
  }


  // ============================================================
  // FILTERED LISTS
  // ============================================================

  get filteredBranches() {

    return this.branchList.filter(
      (branch) =>
        this.selectedCompanies.includes(
          branch.parentId
        )
    );
  }


  get filteredDepartments() {

    return this.departmentList.filter(
      (department) =>
        this.selectedBranches.includes(
          department.parentId
        )
    );
  }


  get filteredTeams() {

    return this.teamsList.filter(
      (team) =>
        this.selectedDepartments.includes(
          team.parentId
        )
    );
  }


  // ============================================================
  // HANDLERS
  // ============================================================

  onCompanyChange(
    val: string[]
  ): void {

    this.formGroup().patchValue({
      selectedBranches: [],
      selectedDepartments: [],
      selectedTeams: []
    });


    this.formGroup()
      .updateValueAndValidity();


    this.companyChange.emit(val);
  }


  onBranchChange(
    val: string[]
  ): void {

    this.formGroup().patchValue({
      selectedDepartments: [],
      selectedTeams: []
    });


    this.formGroup()
      .updateValueAndValidity();


    this.branchChange.emit(val);
  }


  onDepartmentChange(
    val: string[]
  ): void {

    this.formGroup().patchValue({
      selectedTeams: []
    });


    this.formGroup()
      .updateValueAndValidity();


    this.departmentChange.emit(val);
  }


  onTeamsChange(
    val: string[]
  ): void {

    this.formGroup()
      .updateValueAndValidity();


    this.teamsChange.emit(val);
  }


  // ============================================================
  // REQUIRED CHECK
  // ============================================================

  isRequired(
    control: string
  ): boolean {

    const c =
      this.formGroup()
        .get(control);

    return c?.validator?.(
      {} as any
    )?.['required']
      ? true
      : false;
  }
}