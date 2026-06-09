import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Routes publiques
  { path: '', loadComponent: () => import('./public/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'events', loadComponent: () => import('./public/events/events-public.component').then(m => m.EventsPublicComponent) },
  
  // ⭐ AJOUTER CETTE LIGNE ⭐
  { path: 'events/:id', loadComponent: () => import('./public/events/event-detail-public.component').then(m => m.EventDetailPublicComponent) },
  
  { path: 'formations', loadComponent: () => import('./public/formations/formations-public.component').then(m => m.FormationsPublicComponent) },
  
  // ⭐ AJOUTER CETTE LIGNE ⭐
  { path: 'formations/:id', loadComponent: () => import('./public/formations/formation-detail-public.component').then(m => m.FormationDetailPublicComponent) },
  
  // Routes protégées
  { path: 'dashboard', loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [AuthGuard] },
  { path: 'profile', loadComponent: () => import('./admin/profile/profile.component').then(m => m.ProfileComponent), canActivate: [AuthGuard] },
  
  // ⭐ NOUVELLES ROUTES POUR LES MEMBRES ⭐
  { path: 'dashboard/mes-evenements', loadComponent: () => import('./membre/mes-evenements/mes-evenements.component').then(m => m.MesEvenementsComponent), canActivate: [AuthGuard] },
  { path: 'dashboard/mes-formations', loadComponent: () => import('./membre/mes-formations/mes-formations.component').then(m => m.MesFormationsComponent), canActivate: [AuthGuard] },
  { path: 'dashboard/mes-clubs', loadComponent: () => import('./membre/mes-clubs/mes-clubs.component').then(m => m.MesClubsComponent), canActivate: [AuthGuard] },
  
  // Route GED - Commentée temporairement
  // {
  //   path: 'admin/ged',
  //   loadChildren: () => import('./admin/ged/ged.module').then(m => m.GedModule),
  //   canActivate: [AuthGuard]
  // },
  
  { path: '**', redirectTo: '' }
];