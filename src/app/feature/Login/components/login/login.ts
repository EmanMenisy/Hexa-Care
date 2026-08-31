import {
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoginService } from '../../service/login';
import { LoginRequest } from '../../models/login-model';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MenuModule } from 'primeng/menu';
import { UserAccessService } from '../../../../core/services/user-access/user-access';
import { Localization } from '../../../../core/services/localization/localization';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { LanguagesLocalization } from '../../../../core/models/enums/localization';
import { InputTextComponent } from "../../../shared/components/primeng/input-text/input-text";


@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    TranslatePipe,
    MenuModule,
    InputTextComponent
],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  standalone: true,
})
export class Login{

  // =====================================================
  // Dependencies
  // =====================================================

  private readonly fb = inject(FormBuilder);
  private readonly loginService = inject(LoginService);
  private readonly localization = inject(Localization);
  private readonly userAccessService = inject(UserAccessService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);


  // =====================================================
  // Signals
  // =====================================================

  readonly isSubmitted = signal(false);
  readonly currentLang = this.localization.selectedLang;


  // =====================================================
  // Login Form
  // =====================================================

  readonly loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });


  // =====================================================
  // Login
  // =====================================================

  onSubmit(): void {
    this.isSubmitted.set(true);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.isSubmitted.set(false);
      return;
    }

    const formValue = this.loginForm.getRawValue();

    const loginData: LoginRequest = {
      username: formValue.username,
      password: formValue.password,
      rememberMe: formValue.rememberMe,
    };

    this.loginService
      .login(loginData)
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res) => {
           console.log(res);
          localStorage.setItem('orgID',res.organizationID)
          // Initialize user's access and permissions
          this.userAccessService.initialize(res.modules);

          // Build roles hierarchy
          const allRolesWithHierarchy =
            this.buildAllRolesWithHierarchy(
              res.allRolesWithHierarchy
            );

          localStorage.setItem(
            'allRolesWithHierarchy',
            JSON.stringify(allRolesWithHierarchy)
          );

          // Navigate to the first accessible page
          // this.navigateAfterLogin();
          this.router.navigate([''])
        },

        error: (err) => {
          this.isSubmitted.set(false);
          console.error(err);
        },

        complete: () => {
          this.isSubmitted.set(false);
        },
      });
  }


  // =====================================================
  // Navigate After Login
  // =====================================================

  // private navigateAfterLogin(): void {

  //   const modules = this.userAccessService.getModules();

  //   const pages = modules[0]?.pages ?? [];

  //   if (pages.length === 0) {
  //     this.router.navigate(['/access-denied']);
  //     return;
  //   }

  //   const firstPageCode = Math.min(
  //     ...pages.map((page: any) => Number(page.code))
  //   );

  //   const route = this.getRouteByPageCode(
  //     firstPageCode.toString()
  //   );

  //   this.router.navigate([route]);
  // }


  // =====================================================
  // Get Route By Page Code
  // =====================================================

  // private getRouteByPageCode(
  //   pageCode: string,
  //   menu: any[] = []
  // ): string {

  //   for (const item of menu) {

  //     if (item.children?.length) {

  //       const page = item.children.find(
  //         (child: any) =>
  //           child.code?.toString() === pageCode
  //       );

  //       if (page?.route) {
  //         return page.route;
  //       }
  //     }
  //   }

  //   return '/access-denied';
  // }


  // =====================================================
  // Form Validation
  // =====================================================

  isInvalid(controlName: string): boolean {

    const control =
      this.loginForm.get(controlName);

    return !!(
      control?.invalid &&
      control?.touched
    );
  }



  // =====================================================
  // Build Roles Hierarchy
  // =====================================================

  buildAllRolesWithHierarchy(data: any) {

    return [

      // -------------------------------------------------
      // System Roles
      // -------------------------------------------------

      ...data.systemRolesWithHierarchy.flatMap(
        (role: any) =>
          role.hierarchyList.map((h: any) => ({
            roleId: role.roleId,
            roleName: role.roleName,
            hrarircyId: h.hrarircyId,
            hrarircyName: h.hrarircyName,
          }))
      ),


      // -------------------------------------------------
      // Customer Roles
      // -------------------------------------------------

      ...data.customerRolesWithHierarchy.flatMap(
        (role: any) =>
          role.getHarircyForThatRole.map((h: any) => ({
            roleId: role.roleId,
            roleName: role.roleName,
            hrarircyId: h.hrarircyId,
            hrarircyName: h.hrarircyName,
          }))
      ),
    ];
  }


  // =====================================================
  // Language
  // =====================================================

  toggleLanguage(): void {

    const newLang =
      this.currentLang() === LanguagesLocalization.EN
        ? LanguagesLocalization.AR
        : LanguagesLocalization.EN;

    this.localization.setLang(newLang);
  }
}