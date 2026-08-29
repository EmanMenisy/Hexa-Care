import { Component, computed, inject, signal } from '@angular/core';
import { EmployeeCreationService } from '../../service/employee-creation-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmployeeCreationMode } from '../../model/enums/employee-Creation-enums';
import { MultiSelectComponent } from '../../../shared/components/primeng/multi-select/multi-select';

@Component({
  selector: 'app-home-employee-creation',
  imports: [CommonModule],
  templateUrl: './home-employee-creation.html',
  styleUrl: './home-employee-creation.scss',
})
export class HomeEmployeeCreation {
  private readonly creationService = inject(EmployeeCreationService);
  private router = inject(Router);
  selectedSector = signal<boolean | null>(null);
  staffTypes = signal<any[]>([]);

  ngOnInit() {
    this.getAllEmployeeTypes();
  }

  selectSector(isAdmin: boolean) {
    this.selectedSector.set(isAdmin);
  }

  goBack() {
    this.selectedSector.set(null);
  }

  getAllEmployeeTypes() {
    this.creationService.getAllStaffMemberTypes().subscribe({
      next: (res) => {
        console.log(res);
        this.staffTypes.set(res);
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {},
    });
  }

  selectStaffType(staffTypeId: string): void {
    this.router.navigate(['/layout/creation'], {
    queryParams: {
      mode: EmployeeCreationMode.StaffMember,
      staffTypeId,
    },
  });
  }

  doctor(){
    this.router.navigate(['/layout/creation'], {
    queryParams: {
      mode: EmployeeCreationMode.Doctor,
    },
  });
  }
}
