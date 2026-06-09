import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {
  title = 'mellita-frontend';

  constructor(
    private translate: TranslateService,
    private authService: AuthService
  ) {
    translate.addLangs(['fr', 'ar']);
    translate.setDefaultLang('fr');
    const lang = localStorage.getItem('mellita_lang') || 'fr';
    translate.use(lang);
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }

  ngOnInit(): void {}
}
