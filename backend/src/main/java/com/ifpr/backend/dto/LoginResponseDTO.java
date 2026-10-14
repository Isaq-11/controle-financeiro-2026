package com.ifpr.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LoginResponseDTO {
    private String accessToken;
    private String tokenType = "Bearer";
    private long expiresIn = 86400; // 24h em segundos
    private UserResponseDTO usuario;

    public LoginResponseDTO(String accessToken, UserResponseDTO usuario) {
        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.expiresIn = 86400;
        this.usuario = usuario;
    }

    public LoginResponseDTO(String accessToken, String tokenType, long expiresIn, UserResponseDTO usuario) {
        this.accessToken = accessToken;
        this.tokenType = tokenType;
        this.expiresIn = expiresIn;
        this.usuario = usuario;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public UserResponseDTO getUsuario() {
        return usuario;
    }

    public void setUsuario(UserResponseDTO usuario) {
        this.usuario = usuario;
    }
}
