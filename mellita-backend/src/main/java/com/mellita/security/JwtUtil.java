package com.mellita.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    private String secret;
    private Long expiration;

    public JwtUtil() {
        this.secret = "mellitaSuperSecretKey2024ForJWTTokenGeneration";
        this.expiration = 86400000L;
    }

    @Value("${jwt.secret:${app.jwt.secret:mellitaSuperSecretKey2024ForJWTTokenGeneration}}")
    public void setSecret(String secret) {
        this.secret = secret;
    }

    @Value("${jwt.expiration:${app.jwt.expiration.ms:86400000}}")
    public void setExpiration(Long expiration) {
        this.expiration = expiration;
    }

    private Key getSigningKey() {
        byte[] keyBytes = secret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    public String generateToken(UserDetails userDetails, String role) {
        Map<String, Object> claims = new HashMap<>();
        // Ajouter ROLE_ si pas déjà présent
        String roleWithPrefix = role != null && !role.startsWith("ROLE_") ? "ROLE_" + role : role;
        claims.put("role", roleWithPrefix);
        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractRole(String token) {
        final Claims claims = extractAllClaims(token);
        Object roleObj = claims.get("role");
        if (roleObj == null) return null;
        String role = roleObj.toString();
        // S'assurer que le rôle a le préfixe ROLE_
        if (role != null && !role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }
        return role;
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
}