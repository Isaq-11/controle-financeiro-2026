package com.ifpr.backend.dto;

import com.ifpr.backend.model.Usuario;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponseDTO {
    private String accessToken;
    private String tokenType = "Bearer";
    private long expiresIn = 86400; // 24h em segundos
    private Usuario usuario;

    public LoginResponseDTO(String accessToken, Usuario usuario) {
        this.accessToken = accessToken;
        this.usuario = usuario;
    }
}
