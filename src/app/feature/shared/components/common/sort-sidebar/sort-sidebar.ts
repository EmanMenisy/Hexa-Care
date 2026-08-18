import { Component, OnInit, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TranslatePipe } from '@ngx-translate/core';
import { ISort, ISortRequest } from '../../../../../core/models/interface/Isort';
import { FilterService } from '../../../../../core/services/filter/filter';
import { DrawerModule } from 'primeng/drawer';
import { ButtonComponent } from '../../primeng/button/button';


@Component({
  selector: 'hexa-sort-sidebar',
  standalone: true,
  imports: [
    FormsModule,
    RadioButtonModule,
    TranslatePipe,
    DrawerModule,
    ButtonComponent
  ],
  templateUrl: './sort-sidebar.html',
  styleUrl: './sort-sidebar.scss'
})
export class SortSidebarComponent implements OnInit {

  // Input Signal
  visible = input<boolean>(false);

  // Output Signal
  closeDialog = output<void | ISortRequest>();

  selectedKey: keyof ISort | null = null;

  sort: ISortRequest = {
    sortByLastAdded: true
  };

  sortOptions: {
    label: string;
    key: keyof ISort;
  }[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.buildOptions();

    this.sort = this.filterService.mapQueryParamsToFilters<ISortRequest>(
      this.route.snapshot.queryParams,
      this.sort
    );

    this.selectedKey = this.sort.sortByLastAdded
      ? 'lastAddedOnTop'
      : 'firstAddedOnTop';
  }

  onSkip(): void {
    this.selectedKey = this.sort.sortByLastAdded
      ? 'lastAddedOnTop'
      : 'firstAddedOnTop';

    this.closeDialog.emit();
  }

  resetSort(): void {
    this.sort = {
      sortByLastAdded: true
    };

    this.selectedKey = 'lastAddedOnTop';

    this.filterService.saveFiltersInParams(this.sort);

    this.closeDialog.emit(this.sort);
  }

  applySort(): void {
    this.sort = {
      sortByLastAdded: this.selectedKey === 'lastAddedOnTop'
    };

    this.filterService.saveFiltersInParams(this.sort);

    this.closeDialog.emit(this.sort);
  }

  private buildOptions(): void {
    this.sortOptions = [
      {
        label: 'shared.firstOnTop',
        key: 'firstAddedOnTop'
      },
      {
        label: 'shared.lastOnTop',
        key: 'lastAddedOnTop'
      }
    ];
  }
}