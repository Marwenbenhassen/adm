import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  AuthGuard,
  AdminGuard,
  AdminOuAdministratifGuard,
  TresorierGuard,
  FormateurGuard,
  AnimateurGuard
} from './core/guards/auth.guard';
import { PasswordChangeGuard } from './core/guards/password-change.guard';

import { HomeComponent }             from './public/home/home.component';
import { AboutComponent }            from './public/about/about.component';
import { EventsPublicComponent }     from './public/events/events-public.component';
import { NewsPublicComponent }       from './public/news/news-public.component';
import { DonationsPublicComponent }  from './public/donations/donations-public.component';
import { LoginComponent }            from './auth/login/login.component';
import { RegisterComponent }         from './auth/register/register.component';
import { ChangePasswordComponent }   from './auth/change-password/change-password.component';
import { DashboardComponent }        from './admin/dashboard/dashboard.component';
import { UsersComponent }            from './admin/users/users.component';
import {
  AdminEventsComponent,
  AdminDocumentsComponent,
  AdminFormationsComponent
} from './admin/events/admin-events.component';
import { FinanceComponent }               from './admin/finance/finance.component';
import { ClubsComponent }                 from './admin/clubs/clubs.component';
import { EcrituresComponent }             from './admin/ecritures/ecritures.component';
import { DemandesInscriptionComponent }   from './admin/demandes-inscription/demandes-inscription.component';
import { PresencesComponent }             from './admin/presences/presences.component';
import { UnauthorizedComponent }          from './shared/unauthorized.component';

import { FormateurDashboardComponent }  from './formateur/formateur-dashboard.component';
import { FormateurFormationsComponent } from './formateur/formateur-formations.component';

import { AnimateurDashboardComponent } from './animateur/animateur-dashboard.component';
import { AnimateurClubsComponent }     from './animateur/animateur-clubs.component';

import { FormationsPublicComponent } from './public/formations/formations-public.component';
import { EventDetailPublicComponent } from './public/events/event-detail-public.component';
import { FormationDetailPublicComponent } from './public/formations/formation-detail-public.component';

const routes: Routes = [

  // ─── PUBLIC ──────────────────────────────────────────────────
  { path: '',          component: HomeComponent },
  { path: 'about',     component: AboutComponent },
  { path: 'events',    component: EventsPublicComponent },
  { path: 'events/:id', component: EventDetailPublicComponent },
  { path: 'news',      component: NewsPublicComponent },
  { path: 'donations', component: DonationsPublicComponent },
  { path: 'formations', component: FormationsPublicComponent },
  { path: 'formations/:id', component: FormationDetailPublicComponent },

  // ─── AUTH ─────────────────────────────────────────────────────
  { path: 'auth/login',           component: LoginComponent },
  { path: 'auth/register',        component: RegisterComponent },
  { path: 'auth/change-password', component: ChangePasswordComponent,
    canActivate: [AuthGuard] },

  // ─── ESPACE FORMATEUR ─────────────────────────────────────────
  {
    path: 'formateur',
    canActivate: [AuthGuard, PasswordChangeGuard, FormateurGuard],
    children: [
      { path: '',               redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',      component: FormateurDashboardComponent },
      { path: 'mes-formations', component: FormateurFormationsComponent }
    ]
  },

  // ─── ESPACE ANIMATEUR ─────────────────────────────────────────
  {
    path: 'animateur',
    canActivate: [AuthGuard, PasswordChangeGuard, AnimateurGuard],
    children: [
      { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AnimateurDashboardComponent },
      { path: 'mes-clubs', component: AnimateurClubsComponent }
    ]
  },

  // ─── ADMIN ────────────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [AuthGuard, PasswordChangeGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      { path: 'dashboard', component: DashboardComponent },

      { path: 'users',
        component: UsersComponent,
        canActivate: [AdminOuAdministratifGuard] },

      { path: 'demandes-inscription',
        component: DemandesInscriptionComponent,
        canActivate: [AdminOuAdministratifGuard] },

      { path: 'events',     component: AdminEventsComponent },
      { path: 'actualites', component: AdminEventsComponent },
      { path: 'documents',  component: AdminDocumentsComponent },
      { path: 'formations', component: AdminFormationsComponent },

      { path: 'clubs',     component: ClubsComponent },
      { path: 'presences', component: PresencesComponent },

      { path: 'ecritures', component: EcrituresComponent },

      { path: 'finance', component: FinanceComponent, canActivate: [TresorierGuard] },
      { path: 'dons',    component: FinanceComponent },

      { path: 'mes-clubs',     component: ClubsComponent },
      { path: 'mes-paiements', component: DashboardComponent },
      { path: 'ged', loadChildren: () => import('./admin/ged/ged-routing.module').then(m => m.GedRoutingModule), canActivate: [AuthGuard] }
    ]
  },

  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}