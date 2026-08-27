package com.ifpr.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ifpr.backend.dto.AdicionarMembroDTO;
import com.ifpr.backend.exception.BusinessException;
import com.ifpr.backend.model.Carteira;
import com.ifpr.backend.model.CarteiraMembro;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.service.CarteiraService;
import com.ifpr.backend.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping({"/api/v1/wallets", "/wallets"})
@CrossOrigin
public class CarteiraController {

    @Autowired
    private CarteiraService carteiraService;

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

    @GetMapping
    public ResponseEntity<List<Carteira>> listar(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Usuario usuario = extrairUsuarioDoHeader(authHeader);
        return ResponseEntity.ok(carteiraService.buscarTodasDoUsuario(usuario.getId()));
    }

    @PostMapping
    public ResponseEntity<Carteira> criar(
            @RequestBody @Valid Carteira carteira,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Usuario usuario = extrairUsuarioDoHeader(authHeader);
        Carteira novaCarteira = carteiraService.criarCarteira(carteira, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaCarteira);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Carteira> detalhar(
            @PathVariable("id") Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Usuario usuario = extrairUsuarioDoHeader(authHeader);
        return ResponseEntity.ok(carteiraService.buscarPorId(id, usuario.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Carteira> atualizar(
            @PathVariable("id") Long id,
            @RequestBody @Valid Carteira carteira,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Usuario usuario = extrairUsuarioDoHeader(authHeader);
        return ResponseEntity.ok(carteiraService.atualizar(id, carteira, usuario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable("id") Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Usuario usuario = extrairUsuarioDoHeader(authHeader);
        carteiraService.excluir(id, usuario);
        return ResponseEntity.noContent().build();
    }

    // Gestão de Membros da Carteira
    @GetMapping("/{id}/members")
    public ResponseEntity<List<CarteiraMembro>> listarMembros(
            @PathVariable("id") Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Usuario usuario = extrairUsuarioDoHeader(authHeader);
        return ResponseEntity.ok(carteiraService.listarMembros(id, usuario.getId()));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<CarteiraMembro> adicionarMembro(
            @PathVariable("id") Long id,
            @RequestBody @Valid AdicionarMembroDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Usuario usuario = extrairUsuarioDoHeader(authHeader);
        CarteiraMembro membro = carteiraService.adicionarMembro(id, dto.getEmail(), dto.getRole(), usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(membro);
    }

    @PatchMapping("/{id}/members/{userId}")
    public ResponseEntity<CarteiraMembro> alterarPapelMembro(
            @PathVariable("id") Long id,
            @PathVariable("userId") Long targetUserId,
            @RequestBody @Valid AdicionarMembroDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Usuario usuario = extrairUsuarioDoHeader(authHeader);
        CarteiraMembro membro = carteiraService.alterarPapelMembro(id, targetUserId, dto.getRole(), usuario);
        return ResponseEntity.ok(membro);
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removerMembro(
            @PathVariable("id") Long id,
            @PathVariable("userId") Long targetUserId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Usuario usuario = extrairUsuarioDoHeader(authHeader);
        carteiraService.removerMembro(id, targetUserId, usuario);
        return ResponseEntity.noContent().build();
    }
}
