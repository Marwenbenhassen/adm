package com.mellita.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public void envoyerEmailBienvenue(String destinataire, String prenom, String nom, String motDePasseTemporaire) {
        if (mailSender == null || fromEmail.isEmpty()) {
            System.out.println("╔═══════════════════════════════════════════════════════════════╗");
            System.out.println("║  EMAIL DE BIENVENUE (Configuration SMTP manquante)           ║");
            System.out.println("╠═══════════════════════════════════════════════════════════════╣");
            System.out.println("  À        : " + destinataire);
            System.out.println("  Nom      : " + prenom + " " + nom);
            System.out.println("  Mot passe: " + motDePasseTemporaire);
            System.out.println("╚═══════════════════════════════════════════════════════════════╝");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(destinataire);
            helper.setSubject("🏆 Bienvenue à l'Association de Développement de Mellita");
            helper.setFrom(fromEmail);

            // Version SIMPLIFIÉE sans caractères % dans le CSS
            String htmlBody = "<!DOCTYPE html>\n" +
                    "<html>\n" +
                    "<head>\n" +
                    "    <meta charset=\"UTF-8\">\n" +
                    "    <title>Bienvenue à l'Association de Développement de Mellita</title>\n" +
                    "</head>\n" +
                    "<body style=\"margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; color: #333333;\">\n" +
                    "    <table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e1e8ed;\">\n" +
                    "        <tr>\n" +
                    "            <td style=\"padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #1e3c72 0%%, #2a5298 100%%); color: #ffffff;\">\n" +
                    "                <h1 style=\"margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;\">🏆 Mellita Association</h1>\n" +
                    "                <p style=\"margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;\">Plateforme Numérique Intégrée</p>\n" +
                    "            </td>\n" +
                    "        </tr>\n" +
                    "        <tr>\n" +
                    "            <td style=\"padding: 40px 30px;\">\n" +
                    "                <h2 style=\"margin: 0 0 20px 0; font-size: 22px; color: #1e3c72; font-weight: 600;\">Bienvenue " + prenom + " " + nom + " !</h2>\n" +
                    "                <p style=\"font-size: 15px; line-height: 1.6; color: #555555; margin: 0 0 25px 0;\">\n" +
                    "                    Nous avons le plaisir de vous informer que votre demande d'inscription a été approuvée.<br>\n" +
                    "                    Votre compte membre a été créé avec succès. Voici vos identifiants de connexion :\n" +
                    "                </p>\n" +
                    "                <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 30px;\">\n" +
                    "                    <tr>\n" +
                    "                        <td style=\"padding: 20px;\">\n" +
                    "                            <p style=\"margin: 0 0 10px 0; font-size: 15px;\">\n" +
                    "                                📧 <strong style=\"color: #475569;\">Email :</strong> <span style=\"font-family: monospace; font-size: 16px; color: #0f172a;\">" + destinataire + "</span>\n" +
                    "                            </p>\n" +
                    "                            <p style=\"margin: 0; font-size: 15px;\">\n" +
                    "                                🔑 <strong style=\"color: #475569;\">Mot de passe temporaire :</strong> <span style=\"font-family: monospace; font-size: 16px; font-weight: bold; color: #0f172a; background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px;\">" + motDePasseTemporaire + "</span>\n" +
                    "                            </p>\n" +
                    "                        </td>\n" +
                    "                    </tr>\n" +
                    "                </table>\n" +
                    "                <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-bottom: 30px; text-align: center;\">\n" +
                    "                    <tr>\n" +
                    "                        <td>\n" +
                    "                            <a href=\"http://localhost:4200/auth/login\" target=\"_blank\" style=\"background-color: #2a5298; color: #ffffff; padding: 14px 30px; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px; display: inline-block; box-shadow: 0 4px 6px rgba(42, 82, 152, 0.15);\">Se connecter</a>\n" +
                    "                        </td>\n" +
                    "                    </tr>\n" +
                    "                </table>\n" +
                    "                <div style=\"border-top: 1px solid #e2e8f0; padding-top: 25px; margin-top: 25px;\">\n" +
                    "                    <h3 style=\"margin: 0 0 12px 0; font-size: 15px; color: #dc2626; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;\">⚠️ Important :</h3>\n" +
                    "                    <ul style=\"margin: 0; padding-left: 20px; font-size: 14px; color: #64748b; line-height: 1.6;\">\n" +
                    "                        <li style=\"margin-bottom: 8px;\">Connectez-vous avec ce mot de passe temporaire.</li>\n" +
                    "                        <li style=\"margin-bottom: 8px;\">Vous devrez obligatoirement changer votre mot de passe lors de votre première connexion.</li>\n" +
                    "                        <li>Conservez vos identifiants en lieu sûr.</li>\n" +
                    "                    </ul>\n" +
                    "                </div>\n" +
                    "            </td>\n" +
                    "        </tr>\n" +
                    "        <tr>\n" +
                    "            <td style=\"padding: 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 13px; color: #94a3b8;\">\n" +
                    "                <p style=\"margin: 0 0 8px 0; font-weight: 600; color: #64748b;\">Mellita Association - Tous droits réservés</p>\n" +
                    "                <p style=\"margin: 0; font-style: italic;\">Cet email est généré automatiquement, merci de ne pas y répondre.</p>\n" +
                    "            </td>\n" +
                    "        </tr>\n" +
                    "    </table>\n" +
                    "</body>\n" +
                    "</html>";

            helper.setText(htmlBody, true);
            mailSender.send(message);
            System.out.println("✅ Email envoyé avec succès à " + destinataire);

        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'envoi de l'email à " + destinataire + " : " + e.getMessage());
            e.printStackTrace();
            // Ne pas bloquer l'acceptation
        }
    }

    public void envoyerEmailReinitialisationMotDePasse(String destinataire, String prenom, String nom, String nouveauMotDePasse) {
        if (mailSender == null || fromEmail.isEmpty()) {
            System.out.println("╔═══════════════════════════════════════════════════════════════╗");
            System.out.println("║  EMAIL RÉINITIALISATION (Configuration SMTP manquante)       ║");
            System.out.println("╠═══════════════════════════════════════════════════════════════╣");
            System.out.println("  À        : " + destinataire);
            System.out.println("  Nom      : " + prenom + " " + nom);
            System.out.println("  Mot passe: " + nouveauMotDePasse);
            System.out.println("╚═══════════════════════════════════════════════════════════════╝");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(destinataire);
            helper.setSubject("🔑 Réinitialisation de votre mot de passe - Association de Mellita");
            helper.setFrom(fromEmail);

            String htmlBody = "<!DOCTYPE html>\n" +
                    "<html>\n" +
                    "<head>\n" +
                    "    <meta charset=\"UTF-8\">\n" +
                    "    <title>Réinitialisation de votre mot de passe</title>\n" +
                    "</head>\n" +
                    "<body style=\"margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; color: #333333;\">\n" +
                    "    <table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e1e8ed;\">\n" +
                    "        <tr>\n" +
                    "            <td style=\"padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #1e3c72 0%%, #2a5298 100%%); color: #ffffff;\">\n" +
                    "                <h1 style=\"margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;\">🔑 Réinitialisation de mot de passe</h1>\n" +
                    "                <p style=\"margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;\">Mellita Association</p>\n" +
                    "            </td>\n" +
                    "        </tr>\n" +
                    "        <tr>\n" +
                    "            <td style=\"padding: 40px 30px;\">\n" +
                    "                <h2 style=\"margin: 0 0 20px 0; font-size: 22px; color: #1e3c72; font-weight: 600;\">Bonjour " + prenom + " " + nom + ",</h2>\n" +
                    "                <p style=\"font-size: 15px; line-height: 1.6; color: #555555; margin: 0 0 25px 0;\">\n" +
                    "                    Votre mot de passe a été réinitialisé avec succès. Voici vos nouveaux identifiants de connexion :\n" +
                    "                </p>\n" +
                    "                <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 30px;\">\n" +
                    "                    <tr>\n" +
                    "                        <td style=\"padding: 20px;\">\n" +
                    "                            <p style=\"margin: 0 0 10px 0; font-size: 15px;\">\n" +
                    "                                📧 <strong style=\"color: #475569;\">Email :</strong> <span style=\"font-family: monospace; font-size: 16px; color: #0f172a;\">" + destinataire + "</span>\n" +
                    "                            </p>\n" +
                    "                            <p style=\"margin: 0; font-size: 15px;\">\n" +
                    "                                🔑 <strong style=\"color: #475569;\">Nouveau mot de passe :</strong> <span style=\"font-family: monospace; font-size: 16px; font-weight: bold; color: #0f172a; background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px;\">" + nouveauMotDePasse + "</span>\n" +
                    "                            </p>\n" +
                    "                        </td>\n" +
                    "                    </tr>\n" +
                    "                </table>\n" +
                    "                <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-bottom: 30px; text-align: center;\">\n" +
                    "                    <tr>\n" +
                    "                        <td>\n" +
                    "                            <a href=\"http://localhost:4200/auth/login\" target=\"_blank\" style=\"background-color: #2a5298; color: #ffffff; padding: 14px 30px; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px; display: inline-block; box-shadow: 0 4px 6px rgba(42, 82, 152, 0.15);\">Se connecter</a>\n" +
                    "                        </td>\n" +
                    "                    </tr>\n" +
                    "                </table>\n" +
                    "                <div style=\"border-top: 1px solid #e2e8f0; padding-top: 25px; margin-top: 25px;\">\n" +
                    "                    <h3 style=\"margin: 0 0 12px 0; font-size: 15px; color: #dc2626; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;\">⚠️ Important :</h3>\n" +
                    "                    <ul style=\"margin: 0; padding-left: 20px; font-size: 14px; color: #64748b; line-height: 1.6;\">\n" +
                    "                        <li style=\"margin-bottom: 8px;\">Vous devez obligatoirement changer ce mot de passe lors de votre prochaine connexion.</li>\n" +
                    "                        <li>Conservez vos identifiants en lieu sûr.</li>\n" +
                    "                    </ul>\n" +
                    "                </div>\n" +
                    "            </td>\n" +
                    "        </tr>\n" +
                    "        <tr>\n" +
                    "            <td style=\"padding: 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 13px; color: #94a3b8;\">\n" +
                    "                <p style=\"margin: 0 0 8px 0; font-weight: 600; color: #64748b;\">Mellita Association - Tous droits réservés</p>\n" +
                    "                <p style=\"margin: 0; font-style: italic;\">Cet email est généré automatiquement, merci de ne pas y répondre.</p>\n" +
                    "            </td>\n" +
                    "        </tr>\n" +
                    "    </table>\n" +
                    "</body>\n" +
                    "</html>";

            helper.setText(htmlBody, true);
            mailSender.send(message);
            System.out.println("✅ Email de réinitialisation envoyé à " + destinataire);

        } catch (Exception e) {
            System.err.println("❌ Erreur envoi email réinitialisation : " + e.getMessage());
        }
    }
}