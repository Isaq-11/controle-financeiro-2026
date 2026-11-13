package com.ifpr.backend.controller;

import java.time.LocalDate;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ifpr.backend.dto.AiInsightDTO;
import com.ifpr.backend.exception.BusinessException;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.service.AiService;
import com.ifpr.backend.service.UsuarioService;

@RestController
@RequestMapping({"/api/v1/wallets/{walletId}/ai", "/wallets/{walletId}/ai"})
public class AiController {

    @Autowired
    private AiService aiService;

    @Autowired
    private UsuarioService usuarioService;

    private Usuario extrairUsuarioDoHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new BusinessException("Usuário não autenticado.");
        }
        try {
            String token = authHeader.replace("Bearer ", "").trim();
            if (token.startsWith("token_bearer_")) {
                String[] partes = token.split("_");
                Long userId = Long.parseLong(partes[2]);
                return usuarioService.findById(userId);
            }
        } catch (Exception e) {}
        throw new BusinessException("Sessão inválida ou token expirado.");
    }

    // Consulta se a chave do Gemini está configurada e pronta para uso
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> obterStatus(
            @PathVariable("walletId") Long walletId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Usuario usuario = extrairUsuarioDoHeader(authHeader);
        Map<String, Object> status = aiService.obterStatus(walletId, usuario);
        return ResponseEntity.ok(status);
    }

    // Gera os insights financeiros com IA com base no período selecionado
    @GetMapping("/insights")
    public ResponseEntity<AiInsightDTO> gerarInsights(
            @PathVariable("walletId") Long walletId,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Usuario usuario = extrairUsuarioDoHeader(authHeader);
        AiInsightDTO insights = aiService.gerarInsights(walletId, startDate, endDate, usuario);
        return ResponseEntity.ok(insights);
    }
}

