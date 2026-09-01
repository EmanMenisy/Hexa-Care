import { Component, computed, inject, signal, OnInit, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, NonNullableFormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { merge, startWith } from 'rxjs';
import { EmployeeCreationStepper } from '../employee-creation-stepper/employee-creation-stepper';
import { ButtonComponent } from '../../../shared/components/primeng/button/button';
import { PersonalInfo } from "../personal-information/personal-information";
import { ProfessionalInformation } from "../professional-information/professional-information";
import { EmployeeCreationMode } from '../../model/enums/employee-Creation-enums';
import { AssignationInformation } from '../assignation-information/assignation-information';
import { EmployeeCreationService } from '../../service/employee-creation-service';
import { ToastService } from '../../../../core/services/toast/toast';
import { Localization } from '../../../../core/services/localization/localization';
import { ToastType } from '../../../../core/models/enums/toast-type';
import { Attachments } from "../attachments/attachments";
import { AttachmentRow } from '../../model/employee-creation';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'hexa-employee-creation',
  imports: [EmployeeCreationStepper, TranslatePipe, ButtonComponent, PersonalInfo, ProfessionalInformation, AssignationInformation, Attachments],
  templateUrl: './employee-creation.html',
  styleUrl: './employee-creation.scss',
})
export class EmployeeCreation implements OnInit {
  // ============================================================
  // Injected services
  // ============================================================
  private fb = inject(NonNullableFormBuilder);
  private route = inject(ActivatedRoute);
  public readonly toasterService = inject(ToastService);
  public readonly localizationService = inject(Localization);
  private router = inject(Router);
  private EmployeeCreationService = inject(EmployeeCreationService);
  photoUrl = signal<string | null>(null);
  existingAttachments = signal<any[]>([]);

  // ============================================================
  // Form + stepper state
  // ============================================================
  form = this.buildForm();
  staffAssignationData = signal<any>(null);

  // Step index where the "Save" button appears instead of "Next" (Assignation = step 3)
  private readonly saveStep = signal(3);

  step = signal(1);
  private visitedStep = signal(1); // last step the user has actually reached (used to compute maxStep for the stepper)

  // ============================================================
  // Mode detection: creating a new employee vs updating an existing one
  // ============================================================
  employeeId = this.route.snapshot.paramMap.get('id');
  mode: 'create' | 'update' = this.employeeId ? 'update' : 'create';

  // Id returned by the backend after a successful create, used later to upload documents (step 4)
  createdEmployeeId: string | null = null;

  // Reference to the child component so we can call buildAssignmentPayload()/getScopeLevel() on Save
  @ViewChild(AssignationInformation) assignationInfoCmp?: AssignationInformation;
  @ViewChild(Attachments) attachmentsCmp?: Attachments;

  staffTypeId: string | null = null;

  // Doctor / StaffMember — comes from a query param in the URL
  staffMode = signal<EmployeeCreationMode>(
    Number(this.route.snapshot.queryParamMap.get('mode')) as EmployeeCreationMode
  );

  // ============================================================
  // Form builder
  // ============================================================
  private buildForm() {
    return this.fb.group({
      personal: this.fb.group({
        firstName: ['', Validators.required],
        secondName: [''],
        thirdName: [''],
        lastName: ['', Validators.required],
        name: [''],
        nameArabic: [''],           // staffMember only
        gender: [1],
        dateOfBirth: [''],
        nationality: [''],
        nationalId: [''],           // staffMember only
        maritalStatus: [1],
        bloodGroup: [''],
        mobile: [''],
        email: [''],
        address: [''],
        city: [''],
        governorate: [''],
        postalCode: [''],
        country: [''],
        emergencyContactName: [''], // staffMember only
        emergencyContactPhone: [''],// staffMember only
        username: [''],
        password: [''],
        staffMemberTypeId: [''],
        Photo: [null as File | null],   // stores the actual File object (not a URL), converted to a multipart field on save
      }),

      professional: this.fb.group({
        // shared between doctor and staff
        specialty: [''],
        qualification: [''],
        yearsOfExperience: [0],
        registrationNumber: [''],
        experienceSummary: [''],
        bio: [''],
        languages: [''],
        joiningDate: [''],
        commissionPercent: [0],

        // doctor only
        subSpecialty: [''],
        rank: [0],
        licenseNumber: [''],
        medicalCouncil: [''],
        academicRank: [''],
        areasOfExpertise: [''],
        isActive: [true],
        cashCommissionPercent: [0],
        contractCommissionPercent: [0],

        // staffMember only
        jobTitle: [''],
        employmentType: [1],
        contractEndDate: [''],
        baseSalary: [0],
        insuranceNumber: [''],
        licensingAuthority: [''],
        skills: [''],
        certifications: [''],
      }),

      assignment: this.fb.group({
        company: this.fb.control<string[]>([], this.requiredArray),
        branch: this.fb.control<string[]>([], this.requiredArray),
        department: this.fb.control<string[]>([], this.requiredArray),
        team: this.fb.control<string[]>([], this.requiredArray),
        roles: this.fb.array([this.createRole(true)]), // first row is explicitly the default role
      }),

      documents: this.fb.array<any>([]), // step 4, uploaded separately to a different endpoint after create
    });
  }

  // Simple validator: makes sure the array isn't empty (used for company/branch/department/team)
  private requiredArray(control: AbstractControl): ValidationErrors | null {
    return Array.isArray(control.value) && control.value.length > 0 ? null : { required: true };
  }

  // Called from the parent and also passed as an Input to the child (assignation-information) so it can add new role rows
  // isMain = true only for the first row when the form is built; any row added afterwards defaults to false
  createRole(isMain = false) {
    return this.fb.group({
      isSystemRole: [null as boolean | null, Validators.required],
      roleId: ['', Validators.required],
      isMainRole: [isMain],
      mainHeadHierarchy: ['', isMain ? Validators.required : null], // required only when this row is the default role
      headHierarchy: [[] as string[]], // optional (More Head Hierarchy)

      // UI-only fields, stripped out before sending to the backend
      roleOptions: [[] as any[]],
      headOptions: [[] as any[]],
      headValueField: [''],
    });
  }

  // ============================================================
  // Stepper config
  // ============================================================

  steps = signal([
    {
      label: 'employee.stepper.personal_info',
      subtitle: 'employee.stepper.personal_info_subtitle',
    },
    {
      label: 'employee.stepper.professional',
      subtitle: 'employee.stepper.professional_subtitle',
    },
    {
      label: 'employee.stepper.assignation',
      subtitle: 'employee.stepper.assignation_subtitle',
    },
    {
      label: 'employee.stepper.documents',
      subtitle: 'employee.stepper.documents_subtitle',
    },
  ]);

  // First invalid step (determines how far the user can jump ahead directly in the stepper)
  firstInvalidCap(): number {
    for (let i = 0; i < this.steps().length; i++) {
      if (!this.isStepValid(i)) return i + 1;
    }
    return this.steps().length;
  }

  // Furthest step currently reachable (update = all steps unlocked, create = up to the first invalid step)
  maxStep(): number {
    if (this.mode === 'update') return this.steps().length;
    return Math.min(this.visitedStep(), this.firstInvalidCap());
  }

  // Whether the Next button should be enabled (reads .valid directly so it re-evaluates on every change detection cycle)
  canGoNext(): boolean {
    return this.mode === 'update' || this.isStepValid(this.step() - 1);
  }

  get isLastStep(): boolean {
    return this.step() === this.steps().length;
  }

  // Checks the validity of a specific form group (0=personal, 1=professional, 2=assignment). Any other index returns true
  isStepValid(i: number): boolean {
    const groups = [this.form.controls.personal, this.form.controls.professional, this.form.controls.assignment];
    return i < 3 ? groups[i].valid : true;
  }

  // Whether the current step is the Assignation step (where "Save" replaces "Next")
  get isSaveStep(): boolean {
    return this.step() === this.saveStep();
  }

  // ============================================================
  // Lifecycle
  // ============================================================
  ngOnInit(): void {
    this.initStaffTypeId();

    if (this.mode === 'update' && this.employeeId) {
      this.loadEmployeeData();
      this.loadAttachments();
    }
  }

  // ============================================================
  // ngOnInit helpers
  // ============================================================

  // In create mode, the staff type comes from the route query param.
  // In update mode, it's set later once the employee data is patched.
  private initStaffTypeId(): void {
    const routeStaffTypeId = this.route.snapshot.queryParamMap.get('staffTypeId');
    if (this.mode === 'create') {
      this.staffTypeId = routeStaffTypeId;
    }
  }

  // Fetches and patches the employee's data (doctor or staff member) based on staffMode
  private loadEmployeeData(): void {
    if (!this.employeeId) return;

    if (this.staffMode() === EmployeeCreationMode.StaffMember) {
      this.loadStaffMember(this.employeeId);
    } else {
      this.loadDoctor(this.employeeId);
    }
  }

  private loadStaffMember(employeeId: string): void {
    this.EmployeeCreationService.getStuffMemberById(employeeId).subscribe({
      next: (res) => {
        this.patchStaffForm(res);
        this.staffTypeId = res.basicInfo.staffMemberTypeId;
      },
    });
  }

  private loadDoctor(employeeId: string): void {
    this.EmployeeCreationService.getDoctorDetails(employeeId).subscribe({
      next: (res) => this.patchDoctorForm(res),
      error: (err) => console.log(err),
    });
  }

  // Fetches previously uploaded documents so they show up on the Documents step
  private loadAttachments(): void {
    if (!this.employeeId) return;

    this.EmployeeCreationService.getAttachment(this.employeeId).subscribe({
      next: (res) => {
        const mapped: AttachmentRow[] = (res?.items ?? []).map((item: any) => ({
          id: item.id,
          label: item.title,
          date: new Date(item.uploadedAt),
          fileUrl: item.fileName,
          isExisting: true,
        }));
        this.existingAttachments.set(mapped);
        this.createdEmployeeId = this.employeeId;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/sector']);
  }

  // Called from the Next button (only available on step 1 and 2)
  onNext(): void {
    if (this.isLastStep || !this.canGoNext()) return;
    this.step.update((s) => s + 1);
    if (this.step() > this.visitedStep()) {
      this.visitedStep.set(this.step());
    }
  }

  private patchStaffForm(data: any): void {
    const basic = data.basicInfo ?? {};
    const employment = data.employment ?? {};

    this.form.patchValue({
      personal: {
        firstName: basic.firstName ?? '',
        secondName: basic.secondName ?? '',
        thirdName: basic.thirdName ?? '',
        lastName: basic.lastName ?? '',
        name: basic.name ?? '',
        nameArabic: basic.nameArabic ?? '',
        gender: basic.gender ?? 1,
        dateOfBirth: basic.dateOfBirth ?? '',
        nationality: basic.nationality ?? '',
        nationalId: basic.nationalId ?? '',
        maritalStatus: basic.maritalStatus ?? 1,
        bloodGroup: basic.bloodGroup ?? '',
        mobile: basic.mobile ?? '',
        email: basic.email ?? '',
        address: basic.address ?? '',
        city: basic.city ?? '',
        governorate: basic.governorate ?? '',
        postalCode: basic.postalCode ?? '',
        country: basic.country ?? '',
        emergencyContactName: basic.emergencyContactName ?? '',
        emergencyContactPhone: basic.emergencyContactPhone ?? '',
        username: basic.username ?? '',
        staffMemberTypeId: basic.staffMemberTypeId ?? '',
      },
      professional: {
        jobTitle: employment.jobTitle ?? '',
        employmentType: employment.employmentType ?? 1,
        joiningDate: employment.joiningDate ?? '',
        contractEndDate: employment.contractEndDate ?? '',
        baseSalary: employment.baseSalary ?? 0,
        commissionPercent: employment.commissionPercent ?? 0,
        qualification: employment.qualification ?? '',
        specialty: employment.specialty ?? '',
        yearsOfExperience: employment.yearsOfExperience ?? 0,
        insuranceNumber: employment.insuranceNumber ?? '',
        licensingAuthority: employment.licensingAuthority ?? '',
        registrationNumber: employment.registrationNumber ?? '',
        experienceSummary: employment.experienceSummary ?? '',
        bio: employment.bio ?? '',
        skills: employment.skills ?? '',
        certifications: employment.certifications ?? '',
        languages: employment.languages ?? '',
      },
    });

    this.staffTypeId = basic.staffMemberTypeId ?? this.staffTypeId;
    this.photoUrl.set(basic.photoUrl ?? null);
    this.staffAssignationData.set(data.assignation ?? null);
  }

  private patchDoctorForm(data: any): void {
    const personalInfo = data.personalInformation ?? {};
    const professionalInfo = data.professionalInformation ?? {};
    const assignationInfo = data.assigneionInformation ?? {};

    this.form.patchValue({
      personal: {
        firstName: personalInfo.firstName ?? '',
        secondName: personalInfo.secondName ?? '',
        thirdName: personalInfo.thirdName ?? '',
        lastName: personalInfo.lastName ?? '',
        name: personalInfo.name ?? '',
        gender: personalInfo.gender ?? 1,
        dateOfBirth: personalInfo.dateOfBirth ?? '',
        nationality: personalInfo.nationality ?? '',
        maritalStatus: personalInfo.maritalStatus ?? 1,
        bloodGroup: personalInfo.bloodGroup ?? '',
        mobile: personalInfo.mobile ?? '',
        email: personalInfo.email ?? '',
        address: personalInfo.address ?? '',
        city: personalInfo.city ?? '',
        governorate: personalInfo.governorate ?? '',
        postalCode: personalInfo.postalCode ?? '',
        country: personalInfo.country ?? '',
        username: personalInfo.userName ?? '',
      },
      professional: {
        specialty: professionalInfo.specialization ?? '',
        subSpecialty: professionalInfo.subSpecialization ?? '',
        rank: professionalInfo.rank ?? 0,
        qualification: professionalInfo.qualification ?? '',
        yearsOfExperience: professionalInfo.yearsOfExperience ?? 0,
        academicRank: professionalInfo.academicRank ?? '',
        licenseNumber: professionalInfo.licenseNumber ?? '',
        medicalCouncil: professionalInfo.medicalCouncil ?? '',
        registrationNumber: professionalInfo.registrationNumber ?? '',
        joiningDate: professionalInfo.joiningDate ?? '',
        experienceSummary: professionalInfo.experienceSummary ?? '',
        bio: professionalInfo.bio ?? '',
        areasOfExpertise: professionalInfo.areasOfExpertise ?? '',
        languages: professionalInfo.languages ?? '',
        cashCommissionPercent: professionalInfo.cashCommissionPercent ?? 0,
        contractCommissionPercent: professionalInfo.contractCommissionPercent ?? 0,
      },
    });
    this.photoUrl.set(personalInfo.photoUrl ?? null);

    
    this.staffAssignationData.set({
      assigneStructure: assignationInfo.scopes ?? null,
      roles: assignationInfo.roles ?? [],
    });
  }

  // ============================================================
  // Helpers
  // ============================================================

  // Converts any date value (Date object or string) into the "YYYY-MM-DD" format required by the backend
  private formatDateOnly(value: any): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  }

  // ============================================================
  // Build FormData — Doctor
  // Builds a multipart/form-data payload matching the CreateDoctor endpoint's Swagger schema.
  // Every simple field is sent as "GroupName.FieldName".
  // Complex arrays (Roles, Company) are sent as a single JSON string per field.
  // ============================================================
  private buildDoctorFormData(): FormData {
    const { personal, professional } = this.form.getRawValue();
    const assignment = this.assignationInfoCmp?.buildAssignmentPayload();
    const scopeLevel = this.assignationInfoCmp?.getScopeLevel() ?? 0;
    const fd = new FormData();

    // ---------- PersonalInformation ----------
    if (this.mode === 'update' && this.employeeId) {
      fd.append('id', this.employeeId);
    }
    fd.append('PersonalInformation.FirstName', personal.firstName ?? '');
    fd.append('PersonalInformation.LastName', personal.lastName ?? '');
    fd.append('PersonalInformation.SecondName', personal.secondName ?? '');
    fd.append('PersonalInformation.ThirdName', personal.thirdName ?? '');
    fd.append('PersonalInformation.Name', personal.name ?? '');
    fd.append('PersonalInformation.Gender', String(personal.gender ?? ''));
    fd.append('PersonalInformation.DateOfBirth', this.formatDateOnly(personal.dateOfBirth));
    fd.append('PersonalInformation.Nationality', personal.nationality ?? '');
    fd.append('PersonalInformation.MaritalStatus', String(personal.maritalStatus ?? ''));
    fd.append('PersonalInformation.BloodGroup', String(personal.bloodGroup ?? ''));
    fd.append('PersonalInformation.Email', personal.email ?? '');
    fd.append('PersonalInformation.Mobile', personal.mobile ?? '');
    fd.append('PersonalInformation.Address', personal.address ?? '');
    fd.append('PersonalInformation.City', personal.city ?? '');
    fd.append('PersonalInformation.Governorate', personal.governorate ?? '');
    fd.append('PersonalInformation.PostalCode', personal.postalCode ?? '');
    fd.append('PersonalInformation.Country', personal.country ?? '');
    fd.append('PersonalInformation.Password', personal.password ?? '');
    fd.append('PersonalInformation.Username', personal.username ?? '');
    if (personal.Photo instanceof File) {
      fd.append('PersonalInformation.Photo', personal.Photo);
    }

    // ---------- ProfessionalInformation ----------
    fd.append('ProfessionalInformation.Specialty', professional.specialty ?? '');
    fd.append('ProfessionalInformation.SubSpecialty', professional.subSpecialty ?? '');
    fd.append('ProfessionalInformation.Rank', String(professional.rank ?? 0));
    fd.append('ProfessionalInformation.Qualification', professional.qualification ?? '');
    fd.append('ProfessionalInformation.YearsOfExperience', String(professional.yearsOfExperience ?? 0));
    fd.append('ProfessionalInformation.LicenseNumber', professional.licenseNumber ?? '');
    fd.append('ProfessionalInformation.MedicalCouncil', professional.medicalCouncil ?? '');
    fd.append('ProfessionalInformation.RegistrationNumber', professional.registrationNumber ?? '');
    fd.append('ProfessionalInformation.ExperienceSummary', professional.experienceSummary ?? '');
    fd.append('ProfessionalInformation.AcademicRank', professional.academicRank ?? '');
    fd.append('ProfessionalInformation.JoiningDate', this.formatDateOnly(professional.joiningDate));
    fd.append('ProfessionalInformation.Bio', professional.bio ?? '');
    fd.append('ProfessionalInformation.AreasOfExpertise', professional.areasOfExpertise ?? '');
    fd.append('ProfessionalInformation.Languages', professional.languages ?? '');
    fd.append('ProfessionalInformation.IsActive', String(professional.isActive ?? true));
    fd.append('ProfessionalInformation.CashCommissionPercent', String(professional.cashCommissionPercent ?? 0));
    fd.append('ProfessionalInformation.ContractCommissionPercent', String(professional.contractCommissionPercent ?? 0));
    fd.append('ProfessionalInformation.CommissionPercent', String(professional.commissionPercent ?? 0));

    // ---------- AssigneionInformationViewModel ----------
    this.appendAssignmentToFormData(fd, 'AssigneionInformationViewModel', assignment);

    return fd;
  }

  // ============================================================
  // Build FormData — Staff Member
  // Same idea as buildDoctorFormData, but with the field names expected by the CreateStaffMember endpoint
  // ============================================================
  private buildStaffFormData(): FormData {
    const { personal, professional } = this.form.getRawValue();
    const assignment = this.assignationInfoCmp?.buildAssignmentPayload();
    const scopeLevel = this.assignationInfoCmp?.getScopeLevel() ?? 0;
    const fd = new FormData();

    // ---------- BasicInfo ----------
    if (this.mode === 'update' && this.employeeId) {
      fd.append('BasicInfo.StaffMemberId', this.employeeId);
    }
    fd.append('BasicInfo.FirstName', personal.firstName ?? '');
    fd.append('BasicInfo.SecondName', personal.secondName ?? '');
    fd.append('BasicInfo.ThirdName', personal.thirdName ?? '');
    fd.append('BasicInfo.LastName', personal.lastName ?? '');
    fd.append('BasicInfo.Name', personal.name ?? '');
    fd.append('BasicInfo.NameArabic', personal.nameArabic ?? '');
    fd.append('BasicInfo.Gender', String(personal.gender ?? ''));
    fd.append('BasicInfo.DateOfBirth', this.formatDateOnly(personal.dateOfBirth));
    fd.append('BasicInfo.Nationality', personal.nationality ?? '');
    fd.append('BasicInfo.NationalId', personal.nationalId ?? '');
    fd.append('BasicInfo.MaritalStatus', String(personal.maritalStatus ?? ''));
    fd.append('BasicInfo.BloodGroup', String(personal.bloodGroup ?? ''));
    fd.append('BasicInfo.Mobile', personal.mobile ?? '');
    fd.append('BasicInfo.Email', personal.email ?? '');
    fd.append('BasicInfo.Address', personal.address ?? '');
    fd.append('BasicInfo.City', personal.city ?? '');
    fd.append('BasicInfo.Governorate', personal.governorate ?? '');
    fd.append('BasicInfo.PostalCode', personal.postalCode ?? '');
    fd.append('BasicInfo.Country', personal.country ?? '');
    fd.append('BasicInfo.EmergencyContactName', personal.emergencyContactName ?? '');
    fd.append('BasicInfo.EmergencyContactPhone', personal.emergencyContactPhone ?? '');
    fd.append('BasicInfo.Username', personal.username ?? '');
    fd.append('BasicInfo.Password', personal.password ?? '');
    fd.append('BasicInfo.StaffMemberTypeId', this.staffTypeId ?? '');
    if (personal.Photo instanceof File) {
      fd.append('BasicInfo.Photo', personal.Photo);
    }

    // ---------- Employment ----------
    fd.append('Employment.JobTitle', professional.jobTitle ?? '');
    fd.append('Employment.EmploymentType', String(professional.employmentType ?? ''));
    fd.append('Employment.JoiningDate', this.formatDateOnly(professional.joiningDate));
    fd.append('Employment.ContractEndDate', this.formatDateOnly(professional.contractEndDate));
    fd.append('Employment.BaseSalary', String(professional.baseSalary ?? 0));
    fd.append('Employment.CommissionPercent', String(professional.commissionPercent ?? 0));
    fd.append('Employment.Qualification', professional.qualification ?? '');
    fd.append('Employment.Specialty', professional.specialty ?? '');
    fd.append('Employment.YearsOfExperience', String(professional.yearsOfExperience ?? 0));
    fd.append('Employment.InsuranceNumber', professional.insuranceNumber ?? '');
    fd.append('Employment.LicensingAuthority', professional.licensingAuthority ?? '');
    fd.append('Employment.RegistrationNumber', professional.registrationNumber ?? '');
    fd.append('Employment.ExperienceSummary', professional.experienceSummary ?? '');
    fd.append('Employment.Bio', professional.bio ?? '');
    fd.append('Employment.Skills', professional.skills ?? '');
    fd.append('Employment.Certifications', professional.certifications ?? '');
    fd.append('Employment.Languages', professional.languages ?? '');

    // ---------- Assignation ----------
    this.appendAssignmentToFormData(fd, 'Assignation', assignment);

    return fd;
  }

  // ============================================================
  // Save (triggered from the Save button on the Assignation step)
  // ============================================================
  onSave(): void {
    // only check the first 3 groups (documents isn't required at this point)
    if (
      this.form.controls.personal.invalid ||
      this.form.controls.professional.invalid ||
      this.form.controls.assignment.invalid
    ) {
      this.form.markAllAsTouched(); // reveals all hidden error messages at once
      return;
    }

    if (this.staffMode() === EmployeeCreationMode.Doctor) {
      if (this.mode === 'update') {
        this.updateDoctor(this.buildDoctorFormData());
      } else {
        this.createDoctor(this.buildDoctorFormData());
      }
    } else {
      if (this.mode === 'update') {
        this.updateStaffMember(this.buildStaffFormData());
      } else {
        this.createStaffMember(this.buildStaffFormData());
      }
    }
  }

  // Sends the create request for a Staff Member, then moves to the document upload step on success
  createStaffMember(formData: FormData): void {
    this.EmployeeCreationService.createStaffMember(formData).subscribe({
      next: (res) => {
        this.toasterService.addToast(
          ToastType.SUCCESS,
          this.localizationService.instant('Staff Member Has been created Successfully'),
          '',
          {},
          true,
          false,
        );
        this.createdEmployeeId = res?.id ?? res?.employeeId ?? null;
        this.goToDocumentsStep();
      },

    });
  }

  // Same idea as createStaffMember but for the doctor flow
  createDoctor(formData: FormData): void {
    this.EmployeeCreationService.createDoctor(formData).subscribe({
      next: (res) => {
        this.toasterService.addToast(
          ToastType.SUCCESS,
          this.localizationService.instant('Doctor Has been created Successfully'),
          '',
          {},
          true,
          false,
        );
        this.createdEmployeeId = res?.id ?? res?.employeeId ?? null;
        this.goToDocumentsStep();
      },
    });
  }

  updateStaffMember(formData: FormData): void {
    this.EmployeeCreationService.updateStaffMember(formData).subscribe({
      next: (res) => {
        this.toasterService.addToast(
          ToastType.SUCCESS,
          this.localizationService.instant('Staff Member Has been updated Successfully'),
          '',
          {},
          true,
          false,
        );
        this.goToDocumentsStep();
      },
    });
  }

  updateDoctor(formData: FormData): void {
    this.EmployeeCreationService.updateDoctor(formData).subscribe({
      next: (res) => {
        this.toasterService.addToast(
          ToastType.SUCCESS,
          this.localizationService.instant('Doctor Has been updated Successfully'),
          '',
          {},
          true,
          false,
        );
        this.goToDocumentsStep();
      },
    });
  }

  // ============================================================
  // Appends the assignment structure + roles as indexed multipart
  // fields instead of a JSON.
  // ============================================================
  private appendAssignmentToFormData(fd: FormData, prefix: string, assignment: any): void {
    const structure = assignment?.assigneStructure;

    fd.append(`${prefix}.AssigneStructure.OrganzationId`, structure?.organzationId ?? '');

    (structure?.company ?? []).forEach((company: any, cIndex: number) => {
      const companyPrefix = `${prefix}.AssigneStructure.Company[${cIndex}]`;
      fd.append(`${companyPrefix}.Id`, company.id ?? '');

      (company.branches ?? []).forEach((branch: any, bIndex: number) => {
        const branchPrefix = `${companyPrefix}.branches[${bIndex}]`;
        fd.append(`${branchPrefix}.Id`, branch.id ?? '');

        (branch.departments ?? []).forEach((dept: any, dIndex: number) => {
          const deptPrefix = `${branchPrefix}.departments[${dIndex}]`;
          fd.append(`${deptPrefix}.Id`, dept.id ?? '');

          (dept.teamId ?? []).forEach((teamId: string, tIndex: number) => {
            fd.append(`${deptPrefix}.TeamId[${tIndex}]`, teamId ?? '');
          });
        });
      });
    });

    (assignment?.roles ?? []).forEach((role: any, rIndex: number) => {
      const rolePrefix = `${prefix}.Roles[${rIndex}]`;
      fd.append(`${rolePrefix}.RoleId`, role.roleId ?? '');
      fd.append(`${rolePrefix}.IsMainRole`, String(role.isMainRole ?? false));
      fd.append(`${rolePrefix}.IsSystemRole`, String(role.isSystemRole ?? false));

      (role.hierarchies ?? []).forEach((h: any, hIndex: number) => {
        const hPrefix = `${rolePrefix}.Hierarchies[${hIndex}]`;
        fd.append(`${hPrefix}.HeadHierarchyId`, h.headHierarchyId ?? '');
        fd.append(`${hPrefix}.HeadHierarchyName`, h.headHierarchyName ?? '');
        fd.append(`${hPrefix}.IsMainHierarchy`, String(h.isMainHierarchy ?? false));
      });
    });
  }

  // Moves the user to the Documents step (step 4) after a successful create
  private goToDocumentsStep(): void {
    this.step.set(this.saveStep() + 1);
    if (this.step() > this.visitedStep()) {
      this.visitedStep.set(this.step());
    }
  }

  onUploadDocuments(): void {
  const attachments = this.attachmentsCmp?.getAttachments() ?? [];

  const entityId = this.mode === 'update' ? this.employeeId : this.createdEmployeeId;

  if (!attachments.length || !entityId) {
    this.router.navigate(['/home']);
    return;
  }

  const fd = new FormData();

  fd.append('EntityId', entityId);

  attachments.forEach((item, i) => {
    fd.append(`Attachments[${i}].file`, item.file);
    fd.append(`Attachments[${i}].title`, item.title);
  });

  this.EmployeeCreationService.uploadFile(fd).subscribe({
    next: (res) => {
      this.toasterService.addToast(
        ToastType.SUCCESS,
        this.localizationService.instant('employee.documents.upload_success'),
        '',
        {},
        true,
        false,
      );
      this.router.navigate(['/home']);
    },
  });
}

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent) {
    if (this.form.dirty) {
      event.preventDefault();
      event.returnValue = '';
    }
  }
}