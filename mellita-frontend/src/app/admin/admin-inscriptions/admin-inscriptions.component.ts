import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-inscriptions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-inscriptions">
      <h1>📋 Demandes d'inscription</h1>
      <p>Module en cours de développement...</p>
    </div>
  `,
  styles: [`
    .admin-inscriptions { padding: 24px; }
  `]
})
export class AdminInscriptionsComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}