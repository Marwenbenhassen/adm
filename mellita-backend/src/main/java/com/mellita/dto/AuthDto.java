package com.mellita.dto;

import com.mellita.entity.Role;
import com.mellita.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class AuthDto {

    private AuthDto() {}

    // ===== REQUEST CLASSES =====

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegisterRequest {
        @NotBlank(message = "Le prénom est obligatoire")
        private String prenom;

        @NotBlank(message = "Le nom est obligatoire")
        private String nom;

        @Email(message = "Email invalide")
        private String email;           // Email optionnel pour les membres

        private String motDePasse;      // Généré automatiquement si absent

        private String telephone;
        private String adresse;
        private LocalDate dateNaissance;
        private String lieuNaissance;
        private String nomPere;
        private String nomMere;
        private Role role;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginRequest {
        @Email(message = "Email invalide")
        @NotBlank(message = "L'email est obligatoire")
        private String email;

        @NotBlank(message = "Le mot de passe est obligatoire")
        private String motDePasse;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateUserRequest {
        private String prenom;
        private String nom;
        private String telephone;
        private String adresse;
        private String photo;
        private Role role;
        private User.StatutMembre statut;
        private String motDePasse;      // Optionnel pour la mise à jour
    }

    // ===== RESPONSE CLASSES =====

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginResponse {
        private String token;
        private String type = "Bearer";
        private Long id;
        private String email;
        private String role;
        private String prenom;
        private String nom;

        public static LoginResponse from(String token, User user) {
            return LoginResponse.builder()
                    .token(token)
                    .type("Bearer")
                    .id(user.getId())
                    .email(user.getEmail())
                    .role(user.getRole() != null ? user.getRole().name() : "MEMBRE")
                    .prenom(user.getPrenom())
                    .nom(user.getNom())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthResponse {
        private boolean success;
        private String message;
        private String token;
        private String type;
        private Long id;
        private String prenom;
        private String nom;
        private String email;
        private String role;
        private String roleLabel;

        public static AuthResponse success(String token, User user) {
            AuthResponse response = AuthResponse.builder()
                    .success(true)
                    .message("Authentification réussie")
                    .token(token)
                    .type("Bearer")
                    .build();

            if (user != null) {
                response.setId(user.getId());
                response.setPrenom(user.getPrenom());
                response.setNom(user.getNom());
                response.setEmail(user.getEmail());
                if (user.getRole() != null) {
                    response.setRole(user.getRole().name());
                    response.setRoleLabel(getRoleLabel(user.getRole()));
                }
            }
            return response;
        }

        public static AuthResponse error(String message) {
            return AuthResponse.builder()
                    .success(false)
                    .message(message)
                    .build();
        }

        public static AuthResponse from(String token, User user) {
            return success(token, user);
        }

        private static String getRoleLabel(Role role) {
            return switch (role) {
                case ADMIN -> "Administrateur";
                case ADMINISTRATIF -> "Administratif";
                case TRESORIER -> "Trésorier";
                case FORMATEUR -> "Formateur";
                case ANIMATEUR -> "Animateur de Club";
                case MEMBRE -> "Membre";
            };
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserDto {
        private Long id;
        private String prenom;
        private String nom;
        private String email;
        private String telephone;
        private String adresse;
        private String photo;
        private String role;
        private String roleLabel;
        private String statut;          // StatutMembre sous forme de String
        private LocalDate dateAdhesion;
        private LocalDateTime createdAt;
        private LocalDate dateNaissance;
        private String lieuNaissance;
        private String nomPere;
        private String nomMere;

        public static UserDto from(User user) {
            if (user == null) return null;

            UserDtoBuilder builder = UserDto.builder()
                    .id(user.getId())
                    .prenom(user.getPrenom())
                    .nom(user.getNom())
                    .email(user.getEmail())
                    .telephone(user.getTelephone())
                    .adresse(user.getAdresse())
                    .photo(user.getPhoto())
                    .dateAdhesion(user.getDateAdhesion())
                    .createdAt(user.getCreatedAt());

            if (user.getRole() != null) {
                builder.role(user.getRole().name())
                        .roleLabel(getRoleLabel(user.getRole()));
            }

            if (user.getStatut() != null) {
                builder.statut(user.getStatut().name());
            }

            return builder.build();
        }

        private static String getRoleLabel(Role role) {
            return switch (role) {
                case ADMIN -> "Administrateur";
                case ADMINISTRATIF -> "Administratif";
                case TRESORIER -> "Trésorier";
                case FORMATEUR -> "Formateur";
                case ANIMATEUR -> "Animateur de Club";
                case MEMBRE -> "Membre";
            };
        }
    }
}