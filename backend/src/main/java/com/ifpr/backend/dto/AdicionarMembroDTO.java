package com.ifpr.backend.dto;

import com.ifpr.backend.model.PapelCarteira;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdicionarMembroDTO {

    @NotBlank(message = "O e-mail do membro é obrigatório")
    @Email(message = "Insira um e-mail válido")
    private String email;

    @NotNull(message = "O papel/permissão é obrigatório (DONO, EDITOR, VISUALIZADOR)")
    private PapelCarteira role;
}
