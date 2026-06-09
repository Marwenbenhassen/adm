package com.mellita.controller;

import com.mellita.dto.AuthDto;
import com.mellita.entity.Role;
import com.mellita.entity.User;
import com.mellita.exception.ResourceNotFoundException;
import com.mellita.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.text.Normalizer;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ===== UTILITAIRES : génération d'email =====

    private String genererEmail(String prenom, String nom) {
        String p = Normalizer.normalize(prenom, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String n = Normalizer.normalize(nom, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        p = p.toLowerCase().replaceAll("[^a-z0-9]", "");
        n = n.toLowerCase().replaceAll("[^a-z0-9]", "");

        return p + n + "@mellita.tn";
    }

    private String genererEmailUnique(String prenom, String nom) {
        String base = genererEmail(prenom, nom);

        if (!userRepository.existsByEmail(base)) return base;

        String localPart = base.replace("@mellita.tn", "");
        int i = 1;
        String candidate;
        do {
            candidate = localPart + i + "@mellita.tn";
            i++;
        } while (userRepository.existsByEmail(candidate));

        return candidate;
    }

    // ===== ENDPOINTS PUBLICS =====

    @GetMapping("/membres/profile/{email}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AuthDto.UserDto> getProfile(@PathVariable String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        return ResponseEntity.ok(AuthDto.UserDto.from(user));
    }

    // ===== ENDPOINTS ADMINISTRATION =====

    @GetMapping("/admin/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATIF')")
    public ResponseEntity<List<AuthDto.UserDto>> getAllUsers() {
        return ResponseEntity.ok(
                userRepository.findAll().stream()
                        .map(AuthDto.UserDto::from)
                        .collect(Collectors.toList())
        );
    }

    // ⚠️ IMPORTANT : /search, /stats, /liste-membres, /membres
    // doivent être déclarés AVANT /{id} pour éviter le conflit de routes Spring

    @GetMapping("/admin/users/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATIF')")
    public ResponseEntity<List<AuthDto.UserDto>> searchUsers(
            @RequestParam(required = false) String nom,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Role role) {

        List<User> users;

        if (nom != null && !nom.isBlank()) {
            users = userRepository.findByNomContainingIgnoreCase(nom);
        } else if (email != null && !email.isBlank()) {
            users = userRepository.findByEmailContainingIgnoreCase(email);
        } else if (role != null) {
            users = userRepository.findByRole(role);
        } else {
            users = userRepository.findAll();
        }

        return ResponseEntity.ok(
                users.stream()
                        .map(AuthDto.UserDto::from)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/admin/users/liste-membres")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATIF', 'ANIMATEUR')")
    public ResponseEntity<List<AuthDto.UserDto>> getListeMembres() {
        return ResponseEntity.ok(
                userRepository.findByRoleOrderByNomAsc(Role.MEMBRE)
                        .stream()
                        .map(AuthDto.UserDto::from)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/admin/users/membres")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATIF', 'ANIMATEUR', 'TRESORIER')")
    public ResponseEntity<List<AuthDto.UserDto>> getMembres() {
        return ResponseEntity.ok(
                userRepository.findByRoleOrderByNomAsc(Role.MEMBRE)
                        .stream()
                        .map(AuthDto.UserDto::from)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/admin/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATIF', 'TRESORIER')")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(Map.of(
                "totalUtilisateurs", userRepository.count(),
                "membresActifs", userRepository.findByStatut(User.StatutMembre.ACTIF).size(),
                "membresInactifs", userRepository.findByStatut(User.StatutMembre.INACTIF).size(),
                "totalAdmins", userRepository.findByRole(Role.ADMIN).size(),
                "totalAdministratifs", userRepository.findByRole(Role.ADMINISTRATIF).size(),
                "totalTresoriers", userRepository.findByRole(Role.TRESORIER).size(),
                "totalAnimateurs", userRepository.findByRole(Role.ANIMATEUR).size(),
                "totalFormateurs", userRepository.findByRole(Role.FORMATEUR).size(),
                "totalMembres", userRepository.findByRole(Role.MEMBRE).size()
        ));
    }

    // /{id} en dernier pour éviter les conflits avec les routes statiques ci-dessus
    @GetMapping("/admin/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATIF')")
    public ResponseEntity<AuthDto.UserDto> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", id));
        return ResponseEntity.ok(AuthDto.UserDto.from(user));
    }

    @PostMapping("/admin/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATIF')")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody AuthDto.RegisterRequest request) {

        String email;
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            email = request.getEmail().trim().toLowerCase();

            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Email déjà utilisé : " + email
                ));
            }
        } else {
            email = genererEmailUnique(request.getPrenom(), request.getNom());
        }

        String motDePasse = (request.getMotDePasse() != null && !request.getMotDePasse().isBlank())
                ? request.getMotDePasse()
                : "mellita2025";

        User user = User.builder()
                .prenom(request.getPrenom())
                .nom(request.getNom())
                .email(email)
                .motDePasse(passwordEncoder.encode(motDePasse))
                .telephone(request.getTelephone())
                .adresse(request.getAdresse())
                .dateNaissance(request.getDateNaissance())
                .lieuNaissance(request.getLieuNaissance())
                .nomPere(request.getNomPere())
                .nomMere(request.getNomMere())
                .role(request.getRole() != null ? request.getRole() : Role.MEMBRE)
                .statut(User.StatutMembre.ACTIF)
                .build();

        User saved = userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "id", saved.getId(),
                "prenom", saved.getPrenom(),
                "nom", saved.getNom(),
                "email", saved.getEmail(),
                "message", "Utilisateur créé avec succès"
        ));
    }

    @PutMapping("/admin/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATIF')")
    public ResponseEntity<AuthDto.UserDto> updateUser(
            @PathVariable Long id,
            @RequestBody AuthDto.UpdateUserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", id));

        if (request.getPrenom() != null) user.setPrenom(request.getPrenom());
        if (request.getNom() != null) user.setNom(request.getNom());
        if (request.getTelephone() != null) user.setTelephone(request.getTelephone());
        if (request.getAdresse() != null) user.setAdresse(request.getAdresse());
        if (request.getStatut() != null) user.setStatut(request.getStatut());
        if (request.getPhoto() != null) user.setPhoto(request.getPhoto());

        // Mise à jour du rôle (champ présent dans UpdateUserRequest)
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        if (request.getMotDePasse() != null && !request.getMotDePasse().isBlank()) {
            user.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        }

        User updated = userRepository.save(user);
        return ResponseEntity.ok(AuthDto.UserDto.from(updated));
    }

    @PutMapping("/admin/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthDto.UserDto> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", id));

        String roleValue = body.get("role");
        if (roleValue == null || roleValue.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            user.setRole(Role.valueOf(roleValue));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }

        return ResponseEntity.ok(AuthDto.UserDto.from(userRepository.save(user)));
    }

    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> desactiverUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", id));

        user.setStatut(User.StatutMembre.INACTIF);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Utilisateur désactivé avec succès",
                "id", id,
                "statut", "INACTIF"
        ));
    }

    @DeleteMapping("/admin/users/{id}/permanent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteUserPermanently(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", id));

        userRepository.delete(user);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Utilisateur supprimé définitivement",
                "id", id
        ));
    }
}