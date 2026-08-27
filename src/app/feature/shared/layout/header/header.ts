import { Component } from '@angular/core';
import { ButtonComponent } from '../../components/primeng/button/button';
import { InputTextComponent } from '../../components/primeng/input-text/input-text';
import { Badge, BadgeModule } from "primeng/badge";
import { OverlayBadgeModule } from 'primeng/overlaybadge';

@Component({
  selector: 'app-header',
  imports: [ButtonComponent, InputTextComponent, BadgeModule,OverlayBadgeModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
isDarkMode:boolean=true;
}
