import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../components/primeng/button/button';
import { InputTextComponent } from '../../components/primeng/input-text/input-text';
import { Badge, BadgeModule } from "primeng/badge";
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { LanguagesLocalization } from '../../../../core/models/enums/localization';
import { Localization } from '../../../../core/services/localization/localization';

@Component({
  selector: 'app-header',
  imports: [ButtonComponent, InputTextComponent, BadgeModule,OverlayBadgeModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
isDarkMode:boolean=true;
 private readonly localization = inject(Localization);
  readonly currentLang = this.localization.selectedLang;
  toggleLanguage(): void {

    const newLang =
      this.currentLang() === LanguagesLocalization.EN
        ? LanguagesLocalization.AR
        : LanguagesLocalization.EN;

    this.localization.setLang(newLang);
  }
}
