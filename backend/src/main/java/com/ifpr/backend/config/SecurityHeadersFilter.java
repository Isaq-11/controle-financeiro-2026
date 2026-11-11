package com.ifpr.backend.config;

import java.io.IOException;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Filtro de Cabeçalhos de Segurança HTTP alinhado ao OWASP Top 10 (A05:2021 - Security Misconfiguration).
 * Injeta cabeçalhos para proteção contra Clickjacking, MIME-Sniffing e vazamento de referrers.
 */
@Component
@Order(2)
public class SecurityHeadersFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Proteção contra MIME-Sniffing (força o navegador a respeitar o Content-Type declarado)
        response.setHeader("X-Content-Type-Options", "nosniff");

        // Proteção contra Clickjacking (impede que a API ou tela seja renderizada em iframes de outros domínios)
        response.setHeader("X-Frame-Options", "DENY");

        // Filtro contra Cross-Site Scripting (XSS) para navegadores legados
        response.setHeader("X-XSS-Protection", "1; mode=block");

        // Política de Referrer para evitar vazamento de URLs internas
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        // Restringe o acesso a recursos do dispositivo pelo navegador
        response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

        // Para rotas de API, evita cache sensível no navegador do cliente
        String path = request.getRequestURI();
        if (path != null && (path.startsWith("/api/") || path.startsWith("/auth/"))) {
            response.setHeader("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
            response.setHeader("Pragma", "no-cache");
            response.setHeader("Expires", "0");
        }

        filterChain.doFilter(request, response);
    }
}

