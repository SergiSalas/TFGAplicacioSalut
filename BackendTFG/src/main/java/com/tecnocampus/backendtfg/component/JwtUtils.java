package com.tecnocampus.backendtfg.component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String secret;

    public String generateToken(String email, String username) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600000)) // Token válido 1 hora
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();
    }

    // Método para extraer el email del token
    public String extractEmail(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7).trim();
        }
        return getClaims(token).getSubject();
    }

    // Comprueba si el token ha expirado
    private boolean isTokenExpired(String token) {
        Date expiration = getClaims(token).getExpiration();
        return expiration.before(new Date());
    }

    // Valida el token comparándolo con los detalles del usuario
    public boolean validateToken(String token, org.springframework.security.core.userdetails.UserDetails userDetails) {
        String email = extractEmail(token);
        return (email.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    // Método auxiliar para obtener los claims
    private Claims getClaims(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7).trim();
        }
        return Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody();
    }

    // Método para parsear el token y obtener los claims (como ya lo tienes)
    public Claims validateToken(String token) throws Exception {
        return getClaims(token);
    }
}
