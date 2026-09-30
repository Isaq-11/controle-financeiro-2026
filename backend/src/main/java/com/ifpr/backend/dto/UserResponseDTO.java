package com.ifpr.backend.dto;

import java.time.LocalDateTime;
import com.ifpr.backend.model.Usuario;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;

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
}
