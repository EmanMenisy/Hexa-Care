import { Component, inject, OnInit, signal } from '@angular/core';
import { DropdownComponent } from "../../../../shared/components/primeng/drop-down/drop-down";
import { premissionService } from '../../service/premissions';
import { ActivatedRoute } from '@angular/router';
import { ModulePermission } from '../../models/permission';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-premissions',
  imports: [DropdownComponent , ToggleSwitchModule , FormsModule , AccordionModule],
  templateUrl: './premissions.html',
  styleUrl: './premissions.scss',
})
export class Premissions implements OnInit {
   private readonly premissionService = inject(premissionService)
   private readonly route = inject(ActivatedRoute)
   roles = signal<any[]>([]);
   selectedRoleId = signal<string>('');
   permissions = signal<ModulePermission[]>([]);
   isOpen = false;
   ngOnInit(): void {
      this.route.queryParams.subscribe(params => {
      const roleId = params['id'];
      if (roleId) {
        this.selectedRoleId.set(roleId) ;
      }
      });
      this.getAllRoles();
   }

  getAllRoles(pageNumber: number = 1) {
    const obj = { pageNumber };

    this.premissionService.getAllRoles(obj).subscribe({
      next: (res) => {
        // this.roles = res.items.map((item: any) => ({
        //   label: item.name,
        //   value: item.id
        // }));
         this.roles.set(res.items);
          if(this.selectedRoleId()) {
            this.onRoleChange(this.selectedRoleId());
          }
      },
    });
  }

  onRoleChange(roleId:string){
    this.getAllFeatures(roleId);
  }


  getAllFeatures(roleId: string) {
    this.premissionService.getAllFeatures(roleId).subscribe({
      next:(res)=>{
        this.permissions.set(res.modules);
        console.log( this.permissions() , 'premissions');
        
      },
      error:(err)=>{},
      complete:()=>{},
     }
   );
  }

   toggleModule(module: any) {
    module.pages.forEach((page: any) => {
      page.isAllowed = module.isAllowed;
      page.features.forEach((feature: any) => {
        feature.isAllowed = module.isAllowed;
      });
      page.isOpen = module.isAllowed;
    });
  }

   togglePage(page: any, module: any) {
    page.features.forEach((feature: any) => {
      feature.isAllowed = page.isAllowed;
    });
    module.isAllowed = module.pages.some((p: any) => p.isAllowed);
    page.isOpen = module.isAllowed;
  }

   toggleAction(action: any, page: any, module: any) {
    page.isAllowed = page.features.some((a: any) => a.isAllowed);
    module.isAllowed = module.pages.some((p: any) => p.isAllowed);
  }
}
