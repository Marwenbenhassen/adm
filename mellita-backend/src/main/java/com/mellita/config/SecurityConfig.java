package com.mellita.config;

import com.mellita.security.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired private JwtFilter jwtFilter;
    @Autowired private UserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // =====================================================
                        // 1. ENDPOINTS PUBLICS (sans authentification)
                        // =====================================================
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/api/demandes-inscription/public").permitAll()
                        .requestMatchers("/api/demandes-inscription/public/**").permitAll()
                        .requestMatchers("/api/actualites/publics").permitAll()
                        .requestMatchers("/api/evenements/public/**").permitAll()
                        .requestMatchers("/api/formations/public").permitAll()
                        .requestMatchers("/api/clubs/public").permitAll()
                        .requestMatchers("/api/dons/public").permitAll()

                        // Rendre publiques les consultations de détails
                        .requestMatchers(HttpMethod.GET, "/api/evenements/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/formations/**").permitAll()

                        // =====================================================
                        // 2. MES FORMATIONS (MEMBRE, FORMATEUR, ANIMATEUR)
                        // =====================================================
                        .requestMatchers(HttpMethod.GET, "/api/formations/mes-formations")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF", "FORMATEUR", "MEMBRE", "ANIMATEUR")

                        // =====================================================
                        // 3. INSCRIPTIONS (POST)
                        // =====================================================
                        .requestMatchers(HttpMethod.POST, "/api/formations/*/inscriptions")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF", "MEMBRE")
                        .requestMatchers(HttpMethod.POST, "/api/evenements/*/inscriptions")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF", "MEMBRE")

                        // =====================================================
                        // 4. CONSULTATION DES INSCRITS (FORMATEUR)
                        // =====================================================
                        .requestMatchers(HttpMethod.GET, "/api/formations/*/inscriptions")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF", "FORMATEUR")

                        // =====================================================
                        // 5. MISE À JOUR DES PRÉSENCES (FORMATEUR)
                        // =====================================================
                        .requestMatchers(HttpMethod.PUT, "/api/formations/*/inscriptions/*/presence")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF", "FORMATEUR")

                        // Appel par batch (nouveau endpoint - Formateur autorisé)
                        .requestMatchers(HttpMethod.POST, "/api/formations/*/presences/batch")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF", "FORMATEUR")

                        // Lecture des présences par date (Formateur autorisé)
                        .requestMatchers(HttpMethod.GET, "/api/formations/*/presences")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF", "FORMATEUR")

                        // =====================================================
                        // 6. DEMANDES INSCRIPTION (hors route publique)
                        // =====================================================
                        .requestMatchers("/api/demandes-inscription/**")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF")

                        // =====================================================
                        // 7. ADMINISTRATION
                        // =====================================================
                        .requestMatchers("/api/admin/**")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF", "FORMATEUR")
                        .requestMatchers("/api/clubs/*/animateur/**")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF")

                        // =====================================================
                        // 8. ECRITURES COMPTABLES
                        // =====================================================
                        .requestMatchers("/api/ecritures/*/valider")
                        .hasAnyRole("ADMIN", "TRESORIER")
                        .requestMatchers("/api/ecritures/*/rejeter")
                        .hasAnyRole("ADMIN", "TRESORIER")
                        .requestMatchers("/api/ecritures/bilan")
                        .hasAnyRole("ADMIN", "TRESORIER")
                        .requestMatchers("/api/ecritures/en-attente")
                        .hasAnyRole("ADMIN", "TRESORIER")
                        .requestMatchers("/api/ecritures")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF", "TRESORIER")

                        // =====================================================
                        // 9. TRANSACTIONS
                        // =====================================================
                        .requestMatchers("/api/transactions/bilan")
                        .hasAnyRole("ADMIN", "TRESORIER")
                        .requestMatchers("/api/transactions/**")
                        .hasAnyRole("ADMIN", "TRESORIER", "ADMINISTRATIF")

                        // =====================================================
                        // 10. DONS
                        // =====================================================
                        .requestMatchers("/api/dons/**")
                        .hasAnyRole("ADMIN", "TRESORIER", "ADMINISTRATIF")

                        // =====================================================
                        // 11. CLUBS
                        // =====================================================
                        .requestMatchers("/api/clubs/**")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF", "TRESORIER",
                                "ANIMATEUR", "MEMBRE", "FORMATEUR")

                        // =====================================================
                        // 12. FORMATIONS - ÉCRITURE (POST, PUT, DELETE)
                        // =====================================================
                        // POST : seulement ADMIN et ADMINISTRATIF
                        .requestMatchers(HttpMethod.POST, "/api/formations/**")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF")

                        // PUT : ADMIN, ADMINISTRATIF et FORMATEUR
                        .requestMatchers(HttpMethod.PUT, "/api/formations/**")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF", "FORMATEUR")

                        // DELETE : seulement ADMIN et ADMINISTRATIF
                        .requestMatchers(HttpMethod.DELETE, "/api/formations/**")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF")

                        // =====================================================
                        // 13. ÉVÉNEMENTS - ÉCRITURE (POST, PUT, DELETE)
                        // =====================================================
                        .requestMatchers(HttpMethod.POST, "/api/evenements/**")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF")
                        .requestMatchers(HttpMethod.PUT, "/api/evenements/**")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF")
                        .requestMatchers(HttpMethod.DELETE, "/api/evenements/**")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF")

                        // =====================================================
                        // 14. ACTUALITÉS & DOCUMENTS
                        // =====================================================
                        .requestMatchers("/api/actualites/**")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF", "MEMBRE",
                                "TRESORIER", "FORMATEUR", "ANIMATEUR")
                        .requestMatchers("/api/documents/**")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF", "MEMBRE",
                                "TRESORIER", "FORMATEUR", "ANIMATEUR")

                        // =====================================================
                        // 15. MEMBRES
                        // =====================================================
                        .requestMatchers("/api/membres/**")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF", "TRESORIER",
                                "MEMBRE", "FORMATEUR", "ANIMATEUR")

                        // =====================================================
                        // 16. STATISTIQUES
                        // =====================================================
                        .requestMatchers("/api/formations/stats")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF")
                        .requestMatchers("/api/evenements/stats")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF")
                        .requestMatchers("/api/clubs/stats")
                        .hasAnyRole("ADMIN", "ADMINISTRATIF")

                        // Tout autre endpoint nécessite une authentification
                        .anyRequest().authenticated()
                )
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(
                Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}