package com.mellita.config;

import com.mellita.entity.*;
import com.mellita.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private EvenementRepository evenementRepository;
    @Autowired private ActualiteRepository actualiteRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private DonRepository donRepository;
    @Autowired private FormationRepository formationRepository;
    @Autowired private ClubRepository clubRepository;
    @Autowired private InscriptionClubRepository inscriptionClubRepository;
    @Autowired private EcritureComptableRepository ecritureRepository;
    @Autowired private DemandeInscriptionRepository demandeInscriptionRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        // ============================
        // CRÉER LES UTILISATEURS
        // ============================
        User admin = userRepository.save(User.builder()
                .prenom("Ahmed").nom("Ben Ali").email("admin@mellita.tn")
                .motDePasse(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN).telephone("+216 71 000 000")
                .adresse("Mellita, Zarzis").statut(User.StatutMembre.ACTIF)
                .dateAdhesion(LocalDate.of(2015, 1, 1)).build());

        User administratif = userRepository.save(User.builder()
                .prenom("Sara").nom("Karoui").email("administratif@mellita.tn")
                .motDePasse(passwordEncoder.encode("admin123"))
                .role(Role.ADMINISTRATIF).telephone("+216 71 000 010")
                .statut(User.StatutMembre.ACTIF)
                .dateAdhesion(LocalDate.of(2018, 3, 1)).build());

        User tresorier = userRepository.save(User.builder()
                .prenom("Fatima").nom("Hamdi").email("tresorier@mellita.tn")
                .motDePasse(passwordEncoder.encode("tresor123"))
                .role(Role.TRESORIER).telephone("+216 71 000 001")
                .statut(User.StatutMembre.ACTIF)
                .dateAdhesion(LocalDate.of(2016, 3, 15)).build());

        User formateur = userRepository.save(User.builder()
                .prenom("Karim").nom("Mansour").email("formateur@mellita.tn")
                .motDePasse(passwordEncoder.encode("form123"))
                .role(Role.FORMATEUR).telephone("+216 71 000 004")
                .statut(User.StatutMembre.ACTIF)
                .dateAdhesion(LocalDate.of(2020, 6, 1)).build());

        User animateur = userRepository.save(User.builder()
                .prenom("Youssef").nom("Belhaj").email("animateur@mellita.tn")
                .motDePasse(passwordEncoder.encode("anim123"))
                .role(Role.ANIMATEUR).telephone("+216 71 000 005")
                .statut(User.StatutMembre.ACTIF)
                .dateAdhesion(LocalDate.of(2021, 9, 1)).build());

        User membre1 = userRepository.save(User.builder()
                .prenom("Mohamed").nom("Trabelsi").email("membre@mellita.tn")
                .motDePasse(passwordEncoder.encode("membre123"))
                .role(Role.MEMBRE).telephone("+216 71 000 002")
                .statut(User.StatutMembre.ACTIF)
                .dateAdhesion(LocalDate.of(2021, 6, 10)).build());

        // ============================
        // DEMANDES D'INSCRIPTION
        // ============================
        demandeInscriptionRepository.save(DemandeInscription.builder()
                .prenom("Amina").nom("Gharbi")
                .email("amina.gharbi@email.tn")
                .telephone("+216 98 123 456")
                .message("Je souhaite rejoindre l'association pour participer aux activités culturelles.")
                .statut(DemandeInscription.StatutDemande.EN_ATTENTE)
                .build());

        demandeInscriptionRepository.save(DemandeInscription.builder()
                .prenom("Salah").nom("Jebali")
                .email("salah.jebali@email.tn")
                .telephone("+216 22 654 321")
                .message("Intéressé par le club de karaté.")
                .statut(DemandeInscription.StatutDemande.EN_ATTENTE)
                .build());

        demandeInscriptionRepository.save(DemandeInscription.builder()
                .prenom("Leila").nom("Bouazizi")
                .email("leila.b@email.tn")
                .statut(DemandeInscription.StatutDemande.ACCEPTEE)
                .motDePasseTemporaire("TempPass123")
                .traitePar(admin)
                .dateTraitement(LocalDateTime.now().minusDays(2))
                .build());

        // ============================
        // CLUBS
        // ============================
        Club clubKarate = clubRepository.save(Club.builder()
                .nom("Club Karaté").nomAr("نادي الكاراتيه")
                .description("Cours de karaté pour tous les niveaux, adultes et enfants.")
                .tarifSeance(15.0).partAnimateur(5.0)
                .typePartAnimateur(Club.TypePartAnimateur.FIXE)
                .lieu("Salle omnisports de Mellita").horaire("Mardi & Jeudi 18h-20h")
                .capaciteMax(25).statut(Club.StatutClub.ACTIF)
                .animateur(animateur).createdBy(admin).build());

        Club clubTaichi = clubRepository.save(Club.builder()
                .nom("Club Taï-Chi").nomAr("نادي تاي تشي")
                .description("Pratique du Taï-Chi Chuan pour le bien-être et la détente.")
                .tarifSeance(10.0).partAnimateur(30.0)
                .typePartAnimateur(Club.TypePartAnimateur.POURCENTAGE)
                .lieu("Espace vert de Mellita").horaire("Samedi 9h-11h")
                .capaciteMax(20).statut(Club.StatutClub.ACTIF)
                .animateur(animateur).createdBy(admin).build());

        // ============================
        // INSCRIPTIONS CLUBS
        // ============================
        inscriptionClubRepository.save(InscriptionClub.builder()
                .membre(membre1).club(clubKarate)
                .nombreSeances(8).montantDuMois(120.0).paye(true).build());

        // ============================
        // ÉVÉNEMENTS
        // ============================
        evenementRepository.save(Evenement.builder()
                .titre("Journée de Nettoyage des Plages")
                .titreAr("يوم تنظيف الشواطئ")
                .description("Opération de nettoyage des plages de Mellita avec la participation des habitants et volontaires.")
                .dateDebut(LocalDateTime.now().plusDays(7))
                .dateFin(LocalDateTime.now().plusDays(7).plusHours(5))
                .lieu("Plage de Mellita").statut(Evenement.StatutEvenement.A_VENIR)
                .capaciteMax(100).prix(0.0).createdBy(admin).build());

        // ============================
        // ACTUALITÉS
        // ============================
        actualiteRepository.save(Actualite.builder()
                .titre("Inauguration de la nouvelle salle de réunion")
                .titreAr("افتتاح قاعة الاجتماعات الجديدة")
                .contenu("L'association de développement de Mellita est heureuse d'annoncer l'inauguration de sa nouvelle salle de réunion.")
                .categorie("Actualité").publie(true).auteur(admin).build());

        // ============================
        // ÉCRITURES COMPTABLES
        // ============================
        ecritureRepository.save(EcritureComptable.builder()
                .libelle("Cotisations membres - Janvier 2025")
                .montant(1500.0).type(EcritureComptable.TypeEcriture.RECETTE)
                .categorie(EcritureComptable.CategorieEcriture.COTISATION)
                .dateEcriture(LocalDate.of(2025, 1, 31))
                .statut(EcritureComptable.StatutEcriture.VALIDEE)
                .saisiPar(administratif).validePar(tresorier)
                .dateValidation(LocalDateTime.of(2025, 2, 1, 10, 0)).build());

        ecritureRepository.save(EcritureComptable.builder()
                .libelle("Paiement animateur karaté - Janvier")
                .montant(200.0).type(EcritureComptable.TypeEcriture.DEPENSE)
                .categorie(EcritureComptable.CategorieEcriture.SALAIRE_ANIMATEUR)
                .dateEcriture(LocalDate.of(2025, 2, 5))
                .statut(EcritureComptable.StatutEcriture.EN_ATTENTE)
                .saisiPar(administratif).build());

        // ============================
        // DONS
        // ============================
        donRepository.save(Don.builder()
                .montant(1000.0).donateur("Société Mellita Pêche")
                .email("contact@mellitapeche.tn")
                .statut(Don.StatutDon.CONFIRME).message("Soutien au développement local")
                .anonyme(false).dateDon(LocalDate.of(2025, 1, 20)).build());

        // ============================
        // FORMATIONS
        // ============================
        formationRepository.save(Formation.builder()
                .titre("Formation en Agriculture Durable")
                .titreAr("تدريب في الزراعة المستدامة")
                .description("Formation pratique sur les techniques d'agriculture durable.")
                .formateur("Dr. Karim Mansour")
                .dateDebut(LocalDate.now().plusDays(14))
                .dateFin(LocalDate.now().plusDays(18))
                .dureeHeures(20).lieu("Centre agricole de Mellita")
                .prix(50.0).capaciteMax(20)
                .statut(Formation.StatutFormation.PLANIFIEE).createdBy(admin).build());

        System.out.println("╔══════════════════════════════════════════════════════════╗");
        System.out.println("║   Données de démonstration chargées avec succès !       ║");
        System.out.println("╠══════════════════════════════════════════════════════════╣");
        System.out.println("║  admin@mellita.tn         / admin123  (ADMIN)            ║");
        System.out.println("║  administratif@mellita.tn / admin123  (ADMINISTRATIF)    ║");
        System.out.println("║  tresorier@mellita.tn     / tresor123 (TRÉSORIER)        ║");
        System.out.println("║  formateur@mellita.tn     / form123   (FORMATEUR)        ║");
        System.out.println("║  animateur@mellita.tn     / anim123   (ANIMATEUR)        ║");
        System.out.println("║  membre@mellita.tn        / membre123 (MEMBRE)           ║");
        System.out.println("╠══════════════════════════════════════════════════════════╣");
        System.out.println("║  📋 2 demandes d'inscription en attente                  ║");
        System.out.println("╚══════════════════════════════════════════════════════════╝");
    }
}
