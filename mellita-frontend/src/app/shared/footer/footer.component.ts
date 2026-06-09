import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-4">
            <div class="d-flex align-items-center gap-2 mb-3">
              <div class="footer-logo">
                <i class="bi bi-flower1"></i>
              </div>
              <div>
                <div class="fw-bold text-white fs-5">Mellita</div>
                <div style="font-size:0.75rem;color:rgba(255,255,255,0.5)">Association de Développement</div>
              </div>
            </div>
            <p style="color:rgba(255,255,255,0.65);font-size:0.9rem;line-height:1.8">
              Œuvrant pour le développement social, culturel et économique de la région de Mellita depuis 2015.
            </p>
            <div class="d-flex gap-2 mt-3">
              <a href="#" class="social-link"><i class="bi bi-facebook"></i></a>
              <a href="#" class="social-link"><i class="bi bi-instagram"></i></a>
              <a href="#" class="social-link"><i class="bi bi-youtube"></i></a>
            </div>
          </div>

          <div class="col-lg-2 col-6">
            <h6 class="text-white fw-bold mb-3">Navigation</h6>
            <ul class="list-unstyled footer-links">
              <li><a routerLink="/">Accueil</a></li>
              <li><a routerLink="/about">À Propos</a></li>
              <li><a routerLink="/events">Événements</a></li>
              <li><a routerLink="/news">Actualités</a></li>
              <li><a routerLink="/formations">Formations</a></li>
            </ul>
          </div>

          <div class="col-lg-3 col-6">
            <h6 class="text-white fw-bold mb-3">Rejoindre</h6>
            <ul class="list-unstyled footer-links">
              <li><a routerLink="/auth/register">Devenir Membre</a></li>
              <li><a routerLink="/donations">Faire un Don</a></li>
              <li><a routerLink="/auth/login">Espace Membre</a></li>
            </ul>
          </div>

          <div class="col-lg-3">
            <h6 class="text-white fw-bold mb-3">Contact</h6>
            <ul class="list-unstyled footer-contact">
              <li>
                <i class="bi bi-geo-alt-fill"></i>
                <span>Mellita, Zarzis, Médenine, Tunisie</span>
              </li>
              <li>
                <i class="bi bi-telephone-fill"></i>
                <span>+216 71 000 000</span>
              </li>
              <li>
                <i class="bi bi-envelope-fill"></i>
                <span>contact&#64;mellita.tn</span>
              </li>
            </ul>
          </div>
        </div>

        <hr style="border-color:rgba(255,255,255,0.1);margin-top:40px">
        <div class="d-flex flex-wrap justify-content-between align-items-center py-3">
        

        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer { background: #0f1923; padding: 60px 0 0; }
    .footer-logo {
      width: 44px; height: 44px;
      background: linear-gradient(135deg, #1a6b3c, #2d9e5f);
      border-radius: 12px; display: flex; align-items: center;
      justify-content: center; color: white; font-size: 1.4rem;
    }
    .footer-links { }
    .footer-links li { margin-bottom: 8px; }
    .footer-links a { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
    .footer-links a:hover { color: #c8a84b; }
    .footer-contact li { display: flex; gap: 10px; margin-bottom: 12px; color: rgba(255,255,255,0.65); font-size: 0.9rem; }
    .footer-contact i { color: #2d9e5f; margin-top: 3px; min-width: 16px; }
    .social-link {
      width: 36px; height: 36px; background: rgba(255,255,255,0.08); border-radius: 8px;
      display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.7);
      text-decoration: none; transition: all 0.2s;
    }
    .social-link:hover { background: #1a6b3c; color: white; }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
