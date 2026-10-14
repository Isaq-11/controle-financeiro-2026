package com.ifpr.backend.dto;

import java.time.LocalDateTime;
import com.ifpr.backend.model.Usuario;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;

    public UserResponseDTO(Long id, String name, String email, LocalDateTime criadoEm, LocalDateTime atualizadoEm) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.criadoEm = criadoEm;
        this.atualizadoEm = atualizadoEm;
    }

    public static UserResponseDTO fromEntity(Usuario usuario) {
        if (usuario == null) return null;
        return new UserResponseDTO(
            usuario.getId(),
            usuario.getName(),
            usuario.getEmail(),
            usuario.getCriadoEm(),
            usuario.getAtualizadoEm()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }

    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(LocalDateTime atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }
}
