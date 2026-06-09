package com.mellita.controller;

import com.mellita.dto.AuthDto;
import com.mellita.entity.Role;
import com.mellita.entity.User;
import com.mellita.repository.UserRepository;
import com.mellita.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private UserDetailsService userDetailsService;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthDto.LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getMotDePasse())
            );
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Email ou mot de passe incorrect"));
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();

        if (user.getStatut() == User.StatutMembre.INACTIF) {
            return ResponseEntity.status(403).body(Map.of("error", "Compte désactivé"));
        }

        // ⭐ Génération du token AVEC le rôle
        String token = jwtUtil.generateToken(userDetails, user.getRole().name());

        AuthDto.AuthResponse response = AuthDto.AuthResponse.from(token, user);

        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("token", response.getToken());
        responseMap.put("type", response.getType());
        responseMap.put("id", response.getId());
        responseMap.put("prenom", response.getPrenom());
        responseMap.put("nom", response.getNom());
        responseMap.put("email", response.getEmail());
        responseMap.put("role", response.getRole());
        responseMap.put("forcePasswordChange", user.getForcePasswordChange() != null && user.getForcePasswordChange());

        return ResponseEntity.ok(responseMap);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email déjà utilisé"));
        }

        User user = User.builder()
                .prenom(request.getPrenom())
                .nom(request.getNom())
                .email(request.getEmail())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .telephone(request.getTelephone())
                .adresse(request.getAdresse())
                .role(Role.MEMBRE)
                .statut(User.StatutMembre.EN_ATTENTE)
                .forcePasswordChange(false)
                .build();

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Inscription réussie. En attente de validation."));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        User user = userRepository.findByEmail(email).orElseThrow();

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("prenom", user.getPrenom());
        userInfo.put("nom", user.getNom());
        userInfo.put("email", user.getEmail());
        userInfo.put("role", user.getRole().name());
        userInfo.put("statut", user.getStatut().name());
        userInfo.put("forcePasswordChange", user.getForcePasswordChange() != null && user.getForcePasswordChange());

        return ResponseEntity.ok(userInfo);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, String> body) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Non authentifié"));
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        User user = userRepository.findByEmail(email).orElseThrow(() ->
                new RuntimeException("Utilisateur non trouvé"));

        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");

        if (newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le nouveau mot de passe est requis"));
        }

        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le mot de passe doit contenir au moins 6 caractères"));
        }

        boolean isForceChange = user.getForcePasswordChange() != null && user.getForcePasswordChange();

        if (!isForceChange) {
            if (oldPassword == null || oldPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "L'ancien mot de passe est requis"));
            }

            if (!passwordEncoder.matches(oldPassword, user.getMotDePasse())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Ancien mot de passe incorrect"));
            }
        }

        if (!isForceChange && passwordEncoder.matches(newPassword, user.getMotDePasse())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le nouveau mot de passe doit être différent de l'ancien"));
        }

        user.setMotDePasse(passwordEncoder.encode(newPassword));
        user.setForcePasswordChange(false);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Mot de passe modifié avec succès"
        ));
    }

    @PostMapping("/force-change-password/{userId}")
    public ResponseEntity<?> forceChangePassword(@PathVariable Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        String tempPassword = "temp123";
        user.setMotDePasse(passwordEncoder.encode(tempPassword));
        user.setForcePasswordChange(true);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Mot de passe réinitialisé. L'utilisateur devra changer son mot de passe à la prochaine connexion.",
                "tempPassword", tempPassword
        ));
    }
}