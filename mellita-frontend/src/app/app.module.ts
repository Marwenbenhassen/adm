import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';

// Shared
import { NavbarComponent }       from './shared/navbar/navbar.component';
import { FooterComponent }       from './shared/footer/footer.component';
import { SidebarComponent }      from './shared/sidebar/sidebar.component';
import { UnauthorizedComponent } from './shared/unauthorized.component';
import { StatusFilterPipe }      from './shared/pipes/status-filter.pipe';

// Public
import { HomeComponent }            from './public/home/home.component';
import { AboutComponent }           from './public/about/about.component';
// EventsPublicComponent est maintenant standalone → plus besoin dans declarations
import { NewsPublicComponent }      from './public/news/news-public.component';
import { DonationsPublicComponent } from './public/donations/donations-public.component';

// Auth
import { LoginComponent }          from './auth/login/login.component';
import { RegisterComponent }       from './auth/register/register.component';
import { ChangePasswordComponent } from './auth/change-password/change-password.component';

// Admin
import { DashboardComponent }   from './admin/dashboard/dashboard.component';
import { UsersComponent }       from './admin/users/users.component';
import {
  AdminEventsComponent,
  AdminDocumentsComponent,
  AdminFormationsComponent
} from './admin/events/admin-events.component';
import { FinanceComponent }             from './admin/finance/finance.component';
import { ClubsComponent }               from './admin/clubs/clubs.component';
import { EcrituresComponent }           from './admin/ecritures/ecritures.component';
import { DemandesInscriptionComponent } from './admin/demandes-inscription/demandes-inscription.component';
import { PresencesComponent }           from './admin/presences/presences.component';

// Formateur
import { FormateurDashboardComponent }  from './formateur/formateur-dashboard.component';
import { FormateurFormationsComponent } from './formateur/formateur-formations.component';

// Animateur
import { AnimateurDashboardComponent } from './animateur/animateur-dashboard.component';
import { AnimateurClubsComponent }     from './animateur/animateur-clubs.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    UnauthorizedComponent,
    StatusFilterPipe,
    HomeComponent,
    AboutComponent,
    // EventsPublicComponent supprimé car maintenant standalone ✅
    NewsPublicComponent,
    DonationsPublicComponent,
    LoginComponent,
    RegisterComponent,
    ChangePasswordComponent,
    DashboardComponent,
    UsersComponent,
    AdminEventsComponent,
    AdminDocumentsComponent,
    AdminFormationsComponent,
    FinanceComponent,
    ClubsComponent,
    EcrituresComponent,
    DemandesInscriptionComponent,
    PresencesComponent,
    FormateurDashboardComponent,
    FormateurFormationsComponent,   // ✅ déjà présent
    AnimateurDashboardComponent,
    AnimateurClubsComponent,        // ✅ déjà présent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    SidebarComponent,
    NavbarComponent,
    FooterComponent,
    TranslateModule.forRoot({
      defaultLanguage: 'fr',
      loader: {
        provide:    TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps:       [HttpClient]
      }
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}