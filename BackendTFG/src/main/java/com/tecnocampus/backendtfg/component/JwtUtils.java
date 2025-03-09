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

    // Genera el token a partir del email y username
    public String generateToken(String email, String username) {
        return Jwts.builder()
                .setSubject(username)
                .claim("email", email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600000)) // Token válido 1 hora
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();
    }

    // Extrae el username (subject) del token
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    // Comprueba si el token ha expirado
    private boolean isTokenExpired(String token) {
        Date expiration = getClaims(token).getExpiration();
        return expiration.before(new Date());
    }

    // Valida el token comparándolo con los detalles del usuario
    public boolean validateToken(String token, org.springframework.security.core.userdetails.UserDetails userDetails) {
        String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    // Método auxiliar para obtener los claims
    private Claims getClaims(String token) {
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
