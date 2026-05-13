package com.grupo_innovar.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final Key key;

    private final long jwtExpirationMs = 86400000; // 24 horas

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    // ==========================
    // GENERAR TOKEN DINÁMICO
    // ==========================
    public String generateToken(Authentication authentication) {

        String email = authentication.getName();

        // Obtener rol real del usuario desde Spring Security
        String role = authentication.getAuthorities()
                .stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("ROLE_USUARIO");

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role) 
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // ==========================
    // EXTRAER EMAIL
    // ==========================
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    // ==========================
    // EXTRAER ROLE
    // ==========================
    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    // ==========================
    // VALIDAR TOKEN
    // ==========================
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            extractAllClaims(token); // valida firma
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    // ==========================
    // VERIFICAR EXPIRACIÓN
    // ==========================
    private boolean isTokenExpired(String token) {
        return extractAllClaims(token)
                .getExpiration()
                .before(new Date());
    }

    // ==========================
    // EXTRAER CLAIMS
    // ==========================
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
