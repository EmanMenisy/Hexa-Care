import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'hexa-skelton',
  imports: [CommonModule , SkeletonModule],
  templateUrl: './skelton.html',
  styleUrl: './skelton.scss',
})
export class Skelton {
  @Input() width: string = '100%';
  @Input() styleClass: string = '';
  @Input() height: string = '16px';
  @Input() borderRadius: string = '20px';
  @Input() size: string = ''; //Size of the Circle or Square.
  @Input() shape: 'circle' | 'rectangle' = 'rectangle'; //Shape of the skeleton.
}
