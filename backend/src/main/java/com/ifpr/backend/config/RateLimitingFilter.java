package com.ifpr.backend.config;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Filtro de Rate Limiting alinhado ao OWASP Top 10 (A07:2021 - Identification and Authentication Failures).
 * Protege rotas sensíveis (/auth/login, /auth/forgot-password, /auth/register) contra ataques de força bruta.
 */
@Component
@Order(1)
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_REQUISICOES_POR_MINUTO = 15;
    private static final long JANELA_TEMPO_MILLIS = 60_000L; // 1 minuto

    // Armazenamento em memória por IP
    private final Map<String, RequisicaoInfo> controleRequisicoes = new ConcurrentHashMap<>();

    private static class RequisicaoInfo {
        long janelaInicio;
        int contador;

        RequisicaoInfo(long inicio, int count) {
            this.janelaInicio = inicio;
            this.contador = count;
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Aplica rate limiting exclusivamente em requisições POST para endpoints sensíveis de autenticação
        if ("POST".equalsIgnoreCase(method) && ehRotaSensivel(path)) {
            String ipCliente = extrairIpCliente(request);
            long agora = System.currentTimeMillis();

            RequisicaoInfo info = controleRequisicoes.compute(ipCliente, (ip, atual) -> {
                if (atual == null || agora - atual.janelaInicio > JANELA_TEMPO_MILLIS) {
                    return new RequisicaoInfo(agora, 1);
                }
                atual.contador++;
                return atual;
            });

            if (info.contador > MAX_REQUISICOES_POR_MINUTO) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write(String.format(
                        "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Muitas tentativas em pouco tempo. Por segurança, aguarde 1 minuto.\",\"timestamp\":\"%s\"}",
                        Instant.now().toString()));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean ehRotaSensivel(String path) {
        if (path == null) return false;
        return path.endsWith("/auth/login") ||
               path.endsWith("/auth/register") ||
               path.endsWith("/auth/forgot-password") ||
               path.contains("/redefinir-senha");
    }

    private String extrairIpCliente(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "desconhecido";
    }
}

