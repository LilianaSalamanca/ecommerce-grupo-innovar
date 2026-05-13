package com.grupo_innovar.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtTokenProvider jwtTokenProvider,
            CustomUserDetailsService userDetailsService
    ) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();

        // 🔓 Rutas públicas que NO deben pasar por el filtro
        return path.startsWith("/api/auth/")
            || path.startsWith("/api/categorias/")
            || path.startsWith("/api/subcategorias/")
            || path.startsWith("/api/productos/")
            || path.startsWith("/api/webhooks/")
            || "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        System.out.println("===== NUEVA REQUEST =====");
System.out.println("URL: " + request.getRequestURI());
System.out.println("METHOD: " + request.getMethod());
System.out.println("AUTH HEADER: " + request.getHeader("Authorization"));

        // permitir preflight sin pasar por JWT
        if (request.getMethod().equalsIgnoreCase("OPTIONS")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = getJwtFromHeader(request);

            System.out.println("TOKEN EXTRAIDO: " + token);

            if (StringUtils.hasText(token)
                    && SecurityContextHolder.getContext().getAuthentication() == null) {

                String email = jwtTokenProvider.extractEmail(token);

                System.out.println("EMAIL DEL TOKEN: " + email);

                if (email != null) {

                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                    System.out.println("USER DETAILS: " + userDetails.getUsername());
System.out.println("VALIDANDO TOKEN...");

                    if (jwtTokenProvider.isTokenValid(token, userDetails)) {

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );

                        authentication.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request)
                        );

                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        System.out.println("✅ TOKEN VÁLIDO - AUTENTICANDO USUARIO");
                    }
                }
            }

        } catch (Exception e) {
            System.out.println("❌ ERROR JWT: ");
e.printStackTrace();
        }

        filterChain.doFilter(request, response);

        System.out.println("AUTH FINAL: " +
    SecurityContextHolder.getContext().getAuthentication());
    }

    private String getJwtFromHeader(HttpServletRequest request) {
        String header = request.getHeader("Authorization");

        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }

        return null;
    }
}