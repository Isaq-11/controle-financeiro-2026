package com.ifpr.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDTO {
    private String accessToken;
    private String tokenType = "Bearer";
    private long expiresIn = 86400; // 24h em segundos
    private UserResponseDTO usuario;

    public LoginResponseDTO(String accessToken, UserResponseDTO usuario) {
        this.accessToken = accessToken;
        this.usuario = usuario;
    }
}
