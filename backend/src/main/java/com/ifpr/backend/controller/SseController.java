package com.ifpr.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.ifpr.backend.exception.BusinessException;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.service.SseNotificacaoService;
import com.ifpr.backend.service.UsuarioService;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:8081", "http://127.0.0.1:5173"})
public class SseController {

    @Autowired
    private SseNotificacaoService sseNotificacaoService;

    @Autowired
    private UsuarioService usuarioService;

    /**
     * Endpoint do stream SSE.
     * Como a API EventSource dos navegadores não permite enviar cabeçalhos customizados (Authorization),
     * este endpoint aceita o token via parâmetro de busca ?token= ou via cabeçalho Authorization tradicional.
     */
    @GetMapping(path = {"/api/v1/stream", "/stream"}, produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(
            @RequestParam(value = "token", required = false) String tokenParam,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.replace("Bearer ", "").trim();
        } else if (tokenParam != null && !tokenParam.isBlank()) {
            token = tokenParam.trim();
        }

        if (token == null) {
            throw new BusinessException("Autenticação necessária para iniciar stream SSE.");
        }

        try {
            if (token.startsWith("token_bearer_")) {
                String[] partes = token.split("_");
                Long userId = Long.parseLong(partes[2]);
                Usuario usuario = usuarioService.findById(userId);
                return sseNotificacaoService.registrar(usuario.getId());
            }
        } catch (Exception e) {
            // falha na extração de token
        }

        throw new BusinessException("Sessão inválida ou token expirado para SSE.");
    }
}
