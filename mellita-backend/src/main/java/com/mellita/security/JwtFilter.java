package com.mellita.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        // Logs de debug (peut être commenté en production)
        String requestURI = request.getRequestURI();
        String method = request.getMethod();

        // Permettre OPTIONS (pre-flight CORS) sans authentification
        if ("OPTIONS".equals(method)) {
            response.setStatus(HttpServletResponse.SC_OK);
            filterChain.doFilter(request, response);
            return;
        }

        // Vérifier si c'est un endpoint public (optionnel, peut être géré par SecurityConfig)
        if (isPublicEndpoint(requestURI)) {
            filterChain.doFilter(request, response);
            return;
        }

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authorizationHeader.substring(7);
        String username = null;
        String role = null;

        try {
            username = jwtUtil.extractUsername(jwt);
            role = jwtUtil.extractRole(jwt);
        } catch (Exception e) {
            logger.warn("Impossible d'extraire les informations du token JWT : " + e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtUtil.validateToken(jwt, userDetails)) {
                    // ✅ CORRECTION : Garantir le préfixe ROLE_ dans tous les cas
                    String finalRole = role != null ? role : "ROLE_USER";

                    // ✅ Ajouter le préfixe ROLE_ si absent
                    if (!finalRole.startsWith("ROLE_")) {
                        finalRole = "ROLE_" + finalRole;
                    }

                    List<SimpleGrantedAuthority> authorities = List.of(
                            new SimpleGrantedAuthority(finalRole)
                    );

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    logger.debug("Authentification réussie pour l'utilisateur: " + username +
                            " avec le rôle: " + finalRole);
                } else {
                    logger.warn("Token JWT invalide pour l'utilisateur: " + username);
                }

            } catch (UsernameNotFoundException e) {
                logger.warn("Utilisateur introuvable: " + username);
            } catch (Exception e) {
                logger.error("Erreur lors de l'authentification: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Vérifie si l'URL demandée est un endpoint public
     * @param requestURI L'URI de la requête
     * @return true si l'endpoint est public, false sinon
     */
    private boolean isPublicEndpoint(String requestURI) {
        // Endpoints publics qui ne nécessitent pas d'authentification
        List<String> publicEndpoints = List.of(
                "/api/auth/",
                "/api/public/",
                "/h2-console/",
                "/api/demandes-inscription/public",
                "/api/actualites/publics",
                "/api/evenements/public/",
                "/api/formations/public",
                "/api/clubs/public",
                "/api/dons/public"
        );

        // Vérification pour les endpoints GET publics (détails)
        // Laisser SecurityConfig gérer les règles détaillées
        // pour ne pas dupliquer la logique

        for (String endpoint : publicEndpoints) {
            if (requestURI.startsWith(endpoint)) {
                return true;
            }
        }

        return false;
    }
}