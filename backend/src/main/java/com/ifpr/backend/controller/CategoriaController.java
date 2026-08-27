package com.ifpr.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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

import com.ifpr.backend.exception.BusinessException;
import com.ifpr.backend.model.Categoria;
import com.ifpr.backend.model.TipoTransacao;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.service.CategoriaService;
import com.ifpr.backend.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping({"/api/v1/categories", "/categories"})
@CrossOrigin
public class CategoriaController {

    @Autowired
    private CategoriaService categoriaService;

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
    public ResponseEntity<List<Categoria>> listar(
            @RequestParam(name = "type", required = false) TipoTransacao tipo,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Usuario usuario = extrairUsuarioDoHeader(authHeader);
        return ResponseEntity.ok(categoriaService.buscarPorUsuario(usuario.getId(), tipo));
    }

    @PostMapping
    public ResponseEntity<Categoria> criar(
            @RequestBody @Valid Categoria categoria,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Usuario usuario = extrairUsuarioDoHeader(authHeader);
        Categoria novaCategoria = categoriaService.salvar(categoria, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaCategoria);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Categoria> atualizar(
            @PathVariable("id") Long id,
            @RequestBody @Valid Categoria categoria,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Usuario usuario = extrairUsuarioDoHeader(authHeader);
        Categoria categoriaAtualizada = categoriaService.atualizar(id, categoria, usuario);
        return ResponseEntity.ok(categoriaAtualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable("id") Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Usuario usuario = extrairUsuarioDoHeader(authHeader);
        categoriaService.excluir(id, usuario);
        return ResponseEntity.noContent().build();
    }
}
