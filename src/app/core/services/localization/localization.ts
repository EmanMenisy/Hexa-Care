import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable } from '@angular/core';
import { FallbackLangChangeEvent, LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Direction, LanguagesLocalization } from '../../models/enums/localization';

@Injectable({
  providedIn: 'root',
})
export class Localization {
  // ────────────────────────────────
  // Dependencies
  // ────────────────────────────────
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

  // ────────────────────────────────
  // Constants
  // ────────────────────────────────
  private readonly AR_STYLESHEET_ID = 'ar-stylesheet';
  private readonly AR_STYLESHEET_PATH = 'ar.css';
  private readonly STORAGE_KEY = 'userLang';
  private readonly DEFAULT_LANG = LanguagesLocalization.EN;

  // ────────────────────────────────
  // Reactive state (Signals)
  // ────────────────────────────────

  /** The current used lang in app, or null if not set yet */
  readonly selectedLang = this.translate.currentLang;

  /** The fallback (default) language for the app, or null if not set yet */
  readonly fallbackLang = this.translate.fallbackLang;

  /** True while the current language is Arabic; also drives RTL layout */
  readonly isRtl = computed(() => this.selectedLang() === LanguagesLocalization.AR);

  // ────────────────────────────────
  // Lifecycle
  // ────────────────────────────────

  constructor() {
    this.init();
  }

  /**
   * Loads the saved language from localStorage on startup,
   * falling back to DEFAULT_LANG if none is saved.
   */
  private init(): void {
    const savedLang = localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT_LANG;
    this.setLang(savedLang);
  }

  // ────────────────────────────────
  // Language management
  // ────────────────────────────────

  /**
   * Sets the current lang, persists it in localStorage,
   * and updates direction + Arabic stylesheet accordingly.
   * @param lang An identifying name for selected lang, should be string
   **/
  setLang(lang: string): void {
    this.translate.use(lang).subscribe(() => {
      localStorage.setItem(this.STORAGE_KEY, lang);
      const direction = this.isRtl() ? Direction.RTL : Direction.LTR;
      this.changeAppDirection(direction);
      this.toggleArabicStylesheet(lang === LanguagesLocalization.AR);
    });
  }

  /**
   * Registers language codes without loading them.
   * @param langs Array of language codes to register
   */
  addLang(langs: string[]): void {
    this.translate.addLangs(langs);
  }

  /**
   * Returns an array of currently available/registered langs.
   **/
  listOfLangs(): readonly string[] {
    return this.translate.getLangs();
  }

  // ────────────────────────────────
  // Translation lookup
  // ────────────────────────────────

  /**
   * Gets the translated value of a key synchronously.
   **/
  instant(key: string, interpolateParams?: object): string {
    if (!key) return '';
    return this.translate.instant(key, interpolateParams);
  }

  // ────────────────────────────────
  // Events
  // ────────────────────────────────

  /**
   * Observable that emits when the current language changes.
   **/
  onLangChange(): Observable<LangChangeEvent> {
    return this.translate.onLangChange;
  }

  /**
   * Observable that emits when the fallback language changes.
   **/
  onFallbackLangChange(): Observable<FallbackLangChangeEvent> {
    return this.translate.onFallbackLangChange;
  }

  // ────────────────────────────────
  // DOM / direction handling
  // ────────────────────────────────

  private changeAppDirection(direction: Direction): void {
    this.document.documentElement.setAttribute('dir', direction);
  }

  /**
   * Dynamically loads or removes the Arabic RTL stylesheet.
   */
  private toggleArabicStylesheet(load: boolean): void {
    const existingArLink = this.document.getElementById(
      this.AR_STYLESHEET_ID,
    ) as HTMLLinkElement | null;

    if (load) {
      if (!existingArLink) {
        const arLink = this.document.createElement('link');
        arLink.id = this.AR_STYLESHEET_ID;
        arLink.rel = 'stylesheet';
        arLink.href = this.AR_STYLESHEET_PATH;
        this.document.head.appendChild(arLink);
      }
    } else {
      existingArLink?.remove();
    }
  }
}
