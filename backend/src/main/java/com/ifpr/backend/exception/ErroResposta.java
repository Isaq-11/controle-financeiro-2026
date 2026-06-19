package com.ifpr.backend.exception;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ErroResposta {
    private int status;
    private String mensagem;
    private LocalDateTime datahora;
}
