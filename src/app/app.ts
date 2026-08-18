import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Login } from './feature/Login/components/login/login';
import { ButtonModule } from 'primeng/button';
import { Localization } from './core/services/localization/localization';
import { LanguagesLocalization } from './core/models/enums/localization';
import { ToasterComponent } from "./feature/shared/components/primeng/toast/toast";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToasterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Hexa-Care');
     readonly localization = inject(Localization);

   toggleLanguage(): void {
    const currentLang = this.localization.selectedLang();

    const newLang =
      currentLang === LanguagesLocalization.EN
        ? LanguagesLocalization.AR
        : LanguagesLocalization.EN;

    this.localization.setLang(newLang);
  }
}
