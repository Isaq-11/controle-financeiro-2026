package com.ifpr.backend.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ifpr.backend.dto.ChangePasswordRequestDTO;
import com.ifpr.backend.dto.ForgotPasswordRequestDTO;
import com.ifpr.backend.dto.ForgotPasswordResponseDTO;
import com.ifpr.backend.dto.LoginRequestDTO;
import com.ifpr.backend.dto.LoginResponseDTO;
import com.ifpr.backend.dto.ResetPasswordRequestDTO;
import com.ifpr.backend.exception.BusinessException;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.service.AuthService;
import com.ifpr.backend.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping
@CrossOrigin
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UsuarioService usuarioService;

    // Helper para extrair o ID do usuário a partir do Header de Autorização simples
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

    // Cadastro de usuário (POST /auth/register)
    @PostMapping("/auth/register")
    public ResponseEntity<Usuario> register(@RequestBody @Valid Usuario usuario) {
        Usuario novousuario = authService.cadastrar(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(novousuario);
    }

    // Login (POST /auth/login)
    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginRequestDTO loginDTO) {
        LoginResponseDTO response = authService.login(loginDTO.getEmail(), loginDTO.getPassword());
        return ResponseEntity.ok(response);
    }

    // Esqueci minha senha (POST /auth/forgot-password)
    @PostMapping("/auth/forgot-password")
    public ResponseEntity<ForgotPasswordResponseDTO> forgotPassword(@RequestBody @Valid ForgotPasswordRequestDTO request) {
        ForgotPasswordResponseDTO response = authService.solicitarRecuperacaoSenha(request.getEmail());
        return ResponseEntity.ok(response);
    }

    // Redefinir senha com token (POST /auth/reset-password)
    @PostMapping("/auth/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody @Valid ResetPasswordRequestDTO request) {
        authService.redefinirSenha(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Senha redefinida com sucesso."));
    }

    // Perfil do usuário logado (GET /api/v1/users/me)
    @GetMapping({"/api/v1/users/me", "/user/me"})
    public ResponseEntity<Usuario> getPerfilLogado(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Usuario usuario = extrairUsuarioDoHeader(authHeader);
        return ResponseEntity.ok(usuario);
    }

    // Alteração de senha da área autenticada (PATCH /api/v1/users/me/password ou POST /user/alterar-senha)
    @PatchMapping({"/api/v1/users/me/password", "/user/alterar-senha"})
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestBody @Valid ChangePasswordRequestDTO request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Usuario usuario = extrairUsuarioDoHeader(authHeader);
        authService.alterarSenha(usuario, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Senha alterada com sucesso."));
    }
}
