import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  template: `
    <app-navbar></app-navbar>

    <!-- Hero -->
    <div class="about-hero">
      <div class="container text-center">
        <div class="about-hero-emblem"><i class="bi bi-flower1"></i></div>
        <h1 class="fw-bold text-white">À Propos de Nous</h1>
        <p class="text-white-50 mt-3 fs-5 mx-auto" style="max-width:560px">
          Découvrez l'histoire, la mission et les valeurs de l'Association de Développement de Mellita
        </p>
      </div>
    </div>

    <!-- Mission Section -->
    <section class="py-5 bg-white">
      <div class="container">
        <div class="row align-items-center g-5">
          <div class="col-lg-6">
            <h2 class="section-title">Notre Mission</h2>
            <p class="text-muted mb-4" style="line-height:2">
              Fondée en 2015, l'Association de Développement de Mellita œuvre pour le bien-être de
              la communauté locale. Notre mission est de promouvoir le développement durable,
              l'éducation, la culture et la solidarité dans la région de Mellita, Zarzis.
            </p>
            <p class="text-muted mb-4" style="line-height:2">
              Nous rassemblons des citoyens, des entreprises et des partenaires institutionnels
              autour de projets concrets qui améliorent la qualité de vie des habitants et
              préservent le patrimoine local.
            </p>
            <div class="row g-3">
              <div class="col-6" *ngFor="let v of values">
                <div class="value-box">
                  <i class="bi {{ v.icon }} value-icon" [style.color]="v.color"></i>
                  <h6 class="fw-bold mb-1">{{ v.titre }}</h6>
                  <p class="text-muted small mb-0">{{ v.desc }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="about-visual-box">
              <div class="visual-card main-card">
                <i class="bi bi-building fs-1 text-white-50"></i>
                <div class="mt-3 text-white">
                  <div class="fs-4 fw-bold">Association de</div>
                  <div class="fs-4 fw-bold">Développement de Mellita</div>
                  <div class="text-white-50 mt-2">Mellita, Zarzis, Médenine, Tunisie</div>
                </div>
              </div>
              <div class="stat-float top-right">
                <div class="sf-value">10+</div>
                <div class="sf-label">Années</div>
              </div>
              <div class="stat-float bottom-left">
                <div class="sf-value">120+</div>
                <div class="sf-label">Membres</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- History Timeline -->
    <section class="py-5" style="background:#f8f9fa">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="section-title text-center">Notre Parcours</h2>
          <p class="text-muted">Les grandes étapes de l'association</p>
        </div>
        <div class="timeline">
          <div class="timeline-item" *ngFor="let item of timeline; let i = index" [class.right]="i % 2 !== 0">
            <div class="timeline-dot"><i class="bi {{ item.icon }}"></i></div>
            <div class="timeline-content">
              <span class="timeline-year">{{ item.year }}</span>
              <h5 class="fw-bold">{{ item.title }}</h5>
              <p class="text-muted small mb-0">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Team / Bureau -->
    <section class="py-5 bg-white">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="section-title text-center">Notre Bureau</h2>
          <p class="text-muted">Les membres du bureau exécutif</p>
        </div>
        <div class="row g-4 justify-content-center">
          <div class="col-md-6 col-lg-3" *ngFor="let member of team">
            <div class="team-card text-center">
              <div class="team-avatar" [style.background]="member.color">
                {{ member.initials }}
              </div>
              <h6 class="fw-bold mt-3 mb-1">{{ member.name }}</h6>
              <span class="team-role">{{ member.role }}</span>
              <p class="text-muted small mt-2">{{ member.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Partners -->
    <section class="py-5" style="background:#f8f9fa">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="section-title text-center">Nos Partenaires</h2>
        </div>
        <div class="row g-4 justify-content-center align-items-center">
          <div class="col-6 col-md-3" *ngFor="let p of partners">
            <div class="partner-card text-center">
              <i class="bi {{ p.icon }} partner-icon"></i>
              <div class="fw-semibold mt-2">{{ p.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-5" style="background:linear-gradient(135deg,#0f4024,#1a6b3c)">
      <div class="container text-center">
        <h2 class="text-white fw-bold mb-3">Rejoignez Notre Communauté</h2>
        <p class="text-white-50 mb-4">Ensemble, construisons un avenir meilleur pour Mellita</p>
        <div class="d-flex gap-3 justify-content-center flex-wrap">
          <a routerLink="/donations" class="btn btn-gold btn-lg px-5 fw-bold">
            <i class="bi bi-heart-fill me-2"></i>Faire un Don
          </a>
        </div>
      </div>
    </section>

    <app-footer></app-footer>
  `,
  styles: [`
    .about-hero { background: linear-gradient(135deg, #0f4024, #1a6b3c, #1e4d7b); padding: 100px 0 80px; }
    .about-hero-emblem { width: 80px; height: 80px; background: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: white; margin: 0 auto 24px; }

    .value-box { background: #f8f9fa; border-radius: 14px; padding: 18px; transition: all 0.3s; }
    .value-box:hover { background: white; box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-3px); }
    .value-icon { font-size: 1.6rem; display: block; margin-bottom: 8px; }

    .about-visual-box { position: relative; height: 420px; }
    .main-card { background: linear-gradient(135deg, #0f4024, #1a6b3c); border-radius: 24px; padding: 40px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
    .stat-float { position: absolute; background: white; border-radius: 14px; padding: 16px 20px; box-shadow: 0 8px 30px rgba(0,0,0,0.12); text-align: center; }
    .stat-float.top-right { top: 20px; right: -10px; }
    .stat-float.bottom-left { bottom: 30px; left: -10px; }
    .sf-value { font-size: 1.8rem; font-weight: 900; color: #1a6b3c; line-height: 1; }
    .sf-label { font-size: 0.75rem; color: #6c757d; margin-top: 4px; }

    /* Timeline */
    .timeline { position: relative; max-width: 800px; margin: 0 auto; }
    .timeline::before { content: ''; position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; background: linear-gradient(to bottom, #1a6b3c, #1e4d7b); transform: translateX(-50%); }
    .timeline-item { display: flex; justify-content: flex-end; padding-right: calc(50% + 30px); margin-bottom: 40px; position: relative; }
    .timeline-item.right { justify-content: flex-start; padding-right: 0; padding-left: calc(50% + 30px); }
    .timeline-dot { position: absolute; left: 50%; top: 20px; width: 44px; height: 44px; background: linear-gradient(135deg, #1a6b3c, #2d9e5f); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1rem; transform: translateX(-50%); z-index: 1; box-shadow: 0 4px 12px rgba(26,107,60,0.4); }
    .timeline-content { background: white; border-radius: 16px; padding: 20px 24px; max-width: 340px; box-shadow: 0 3px 12px rgba(0,0,0,0.07); }
    .timeline-year { background: rgba(26,107,60,0.1); color: #1a6b3c; font-weight: 800; font-size: 0.8rem; padding: 3px 10px; border-radius: 20px; display: inline-block; margin-bottom: 8px; }

    /* Team */
    .team-card { background: white; border-radius: 20px; padding: 28px 20px; box-shadow: 0 3px 14px rgba(0,0,0,0.07); transition: all 0.3s; }
    .team-card:hover { transform: translateY(-6px); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .team-avatar { width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.4rem; font-weight: 800; margin: 0 auto; }
    .team-role { background: rgba(26,107,60,0.1); color: #1a6b3c; padding: 3px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: inline-block; }

    /* Partners */
    .partner-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); transition: all 0.3s; }
    .partner-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
    .partner-icon { font-size: 2.5rem; color: #1a6b3c; display: block; }

    .btn-gold { background: linear-gradient(135deg, #c8a84b, #e8c96b); color: white; border: none; }
    .btn-gold:hover { color: white; transform: translateY(-2px); }

    @media (max-width: 768px) {
      .timeline::before { left: 20px; }
      .timeline-item, .timeline-item.right { justify-content: flex-start; padding: 0 0 0 60px; }
      .timeline-dot { left: 20px; top: 14px; }
    }
  `]
})
export class AboutComponent {
  values = [
    { icon: 'bi-heart-fill', titre: 'Solidarité', desc: 'Soutenir les membres de notre communauté', color: '#e74c3c' },
    { icon: 'bi-shield-check', titre: 'Transparence', desc: 'Gestion financière ouverte et honnête', color: '#1a6b3c' },
    { icon: 'bi-lightbulb-fill', titre: 'Innovation', desc: 'Projets créatifs pour un impact durable', color: '#c8a84b' },
    { icon: 'bi-globe', titre: 'Durabilité', desc: 'Développement respectueux de l\'environnement', color: '#1e4d7b' },
  ];

  timeline = [
    { year: '2015', icon: 'bi-flag-fill', title: 'Fondation de l\'Association', desc: 'Création officielle de l\'Association de Développement de Mellita avec 15 membres fondateurs.' },
    { year: '2017', icon: 'bi-people-fill', title: 'Croissance Membresielle', desc: 'L\'association atteint 50 membres actifs et lance ses premiers programmes sociaux.' },
    { year: '2019', icon: 'bi-trophy-fill', title: 'Premier Festival Culturel', desc: 'Organisation du premier festival culturel de Mellita, un succès avec plus de 500 participants.' },
    { year: '2021', icon: 'bi-mortarboard-fill', title: 'Programme de Formation', desc: 'Lancement d\'un programme de formations professionnelles pour les jeunes de la région.' },
    { year: '2023', icon: 'bi-building', title: 'Nouveau Siège Social', desc: 'Inauguration du nouveau siège de l\'association, doté d\'une salle de réunion moderne.' },
    { year: '2025', icon: 'bi-laptop-fill', title: 'Transformation Numérique', desc: 'Développement de cette plateforme numérique pour moderniser la gestion de l\'association.' },
  ];

  team = [
    { name: 'Ahmed Ben Ali', role: 'Président', initials: 'AB', desc: 'Fondateur et président depuis 2015.', color: 'linear-gradient(135deg, #1a6b3c, #2d9e5f)' },
    { name: 'Fatima Hamdi', role: 'Trésorière', initials: 'FH', desc: 'Responsable de la gestion financière.', color: 'linear-gradient(135deg, #c8a84b, #e8c96b)' },
    { name: 'Mohamed Trabelsi', role: 'Secrétaire Général', initials: 'MT', desc: 'Coordination des activités et membres.', color: 'linear-gradient(135deg, #1e4d7b, #3a7bd5)' },
    { name: 'Leila Nasri', role: 'Responsable Culturel', initials: 'LN', desc: 'Organisation des événements culturels.', color: 'linear-gradient(135deg, #6f42c1, #9b59b6)' },
  ];

  partners = [
    { icon: 'bi-building-fill', name: 'Mairie de Zarzis' },
    { icon: 'bi-bank2', name: 'Banque Régionale' },
    { icon: 'bi-briefcase-fill', name: 'Chambre de Commerce' },
    { icon: 'bi-mortarboard-fill', name: 'Université de Gabès' },
  ];
}
