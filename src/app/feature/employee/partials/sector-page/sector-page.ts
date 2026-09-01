import { Component, computed, inject, signal } from '@angular/core';
import { EmployeeCreationMode } from '../../model/enums/employee-Creation-enums';
import { EmployeeCreationService } from '../../service/employee-creation-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-sector-page',
  imports: [CommonModule , TranslatePipe],
  templateUrl: './sector-page.html',
  styleUrl: './sector-page.scss',
})
export class SectorPage {
  private readonly creationService = inject(EmployeeCreationService);
  private router = inject(Router);
  selectedSector = signal<boolean | null>(null); // null = لسه واقفة على الكاردين، true = إداري، false = طبي
  staffTypes = signal<any[]>([]);

  
  filteredTypes = computed(() =>
    this.staffTypes().filter((t) => t.isAdministrativeSector === this.selectedSector())
  );

  goBack() {
    this.selectedSector.set(null);
  }

  getAllEmployeeTypes() {
    this.creationService.getAllStaffMemberTypes().subscribe({
      next: (res) => this.staffTypes.set(res),
      error: (err) => console.log(err),
    });
  }

  selectStaffType(staffTypeId: string): void {
    this.router.navigate(['/creation'], {
    queryParams: {
      mode: EmployeeCreationMode.StaffMember,
      staffTypeId,
    },
  });
  }

  doctor(){
    this.router.navigate(['/creation'], {
    queryParams: {
      mode: EmployeeCreationMode.Doctor,
    },
  });
  }

  routeToSectorPage(){
    this.router.navigate(['sector']);
  }

  showSector(isAdmin: boolean) {
    this.selectedSector.set(isAdmin);
    this.getAllEmployeeTypes();
  }

  selectDoctorCard(): void {
   this.router.navigate(['creation'], {
    queryParams: { mode: EmployeeCreationMode.Doctor },
  });
}
}
