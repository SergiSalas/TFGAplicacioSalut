package com.tecnocampus.backendtfg.component;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        System.out.println("Entering JwtAuthenticationFilter.doFilterInternal");
        final String authorizationHeader = request.getHeader("Authorization");

        String email = null;
        String token = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            System.out.println("Authorization header found: " + authorizationHeader);
            token = authorizationHeader.substring(7);
            System.out.println("Extracted token: " + token);
            try {
                email = jwtUtils.extractEmail(token);
                System.out.println("Extracted email: " + email);
            } catch (Exception e) {
                System.out.println("Error parsing token: " + e.getMessage());
            }
        } else {
            System.out.println("Authorization header not found or does not start with \"Bearer \"");
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            System.out.println("Loading user details for email: " + email);
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            if (jwtUtils.validateToken(token, userDetails)) {
                System.out.println("Token validated. Setting authentication context.");
                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            } else {
                System.out.println("Invalid token for the given user details.");
            }
        } else {
            System.out.println("Email is null or user is already authenticated.");
        }
        filterChain.doFilter(request, response);
        System.out.println("Exiting JwtAuthenticationFilter.doFilterInternal");
    }
}