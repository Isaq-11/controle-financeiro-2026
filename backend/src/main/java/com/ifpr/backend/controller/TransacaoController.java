package com.ifpr.backend.controller;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ifpr.backend.dto.ResumoFinanceiroDTO;
import com.ifpr.backend.exception.BusinessException;
import com.ifpr.backend.model.TipoTransacao;
import com.ifpr.backend.model.Transacao;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.service.TransacaoService;
import com.ifpr.backend.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping({"/api/v1/wallets/{walletId}", "/wallets/{walletId}"})
@CrossOrigin
public class TransacaoController {

    @Autowired
    private TransacaoService transacaoService;

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

    // Listagem paginada de transações com filtros
    @GetMapping("/transactions")
    public ResponseEntity<Page<Transacao>> listarTransacoes(
            @PathVariable("walletId") Long walletId,
            @RequestParam(name = "type", required = false) TipoTransacao tipo,
            @RequestParam(name = "categoryId", required = false) Long categoryId,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "sort", defaultValue = "data,desc") String sort,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Usuario usuario = extrairUsuarioDoHeader(authHeader);

        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        Sort.Direction direction = (sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc")) ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));

        Page<Transacao> resultado = transacaoService.listarComFiltros(walletId, tipo, categoryId, startDate, endDate, pageable, usuario);
        return ResponseEntity.ok(resultado);
    }

    // Detalhes de uma transação
    @GetMapping("/transactions/{id}")
    public ResponseEntity<Transacao> detalharTransacao(
            @PathVariable("walletId") Long walletId,
            @PathVariable("id") Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Usuario usuario = extrairUsuarioDoHeader(authHeader);
        return ResponseEntity.ok(transacaoService.buscarPorId(walletId, id, usuario));
    }

    // Criar transação
    @PostMapping("/transactions")
    public ResponseEntity<Transacao> criarTransacao(
            @PathVariable("walletId") Long walletId,
            @RequestParam(name = "categoryId", required = false) Long categoryId,
            @RequestBody @Valid Transacao transacao,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Usuario usuario = extrairUsuarioDoHeader(authHeader);
        Transacao novaTransacao = transacaoService.criar(walletId, transacao, categoryId, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaTransacao);
    }

    // Atualizar transação
    @PutMapping("/transactions/{id}")
    public ResponseEntity<Transacao> atualizarTransacao(
            @PathVariable("walletId") Long walletId,
            @PathVariable("id") Long id,
            @RequestParam(name = "categoryId", required = false) Long categoryId,
            @RequestBody @Valid Transacao transacao,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Usuario usuario = extrairUsuarioDoHeader(authHeader);
        Transacao atualizada = transacaoService.atualizar(walletId, id, transacao, categoryId, usuario);
        return ResponseEntity.ok(atualizada);
    }

    // Excluir transação
    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<Void> excluirTransacao(
            @PathVariable("walletId") Long walletId,
            @PathVariable("id") Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Usuario usuario = extrairUsuarioDoHeader(authHeader);
        transacaoService.excluir(walletId, id, usuario);
        return ResponseEntity.noContent().build();
    }

    // Resumo Financeiro do Dashboard (GET /api/v1/wallets/{walletId}/summary)
    @GetMapping("/summary")
    public ResponseEntity<ResumoFinanceiroDTO> obterResumo(
            @PathVariable("walletId") Long walletId,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Usuario usuario = extrairUsuarioDoHeader(authHeader);
        ResumoFinanceiroDTO resumo = transacaoService.calcularResumo(walletId, startDate, endDate, usuario);
        return ResponseEntity.ok(resumo);
    }
}
