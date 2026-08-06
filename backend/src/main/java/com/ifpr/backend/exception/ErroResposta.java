package com.ifpr.backend.exception;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ErroResposta {
    private int status;
    private String error;
    private String mensagem;
    private LocalDateTime timestamp;

    public ErroResposta(int status, String mensagem, LocalDateTime timestamp) {
        this.status = status;
        this.error = getStatusLabel(status);
        this.mensagem = mensagem;
        this.timestamp = timestamp;
    }

    private static String getStatusLabel(int status) {
        switch (status) {
            case 400: return "Bad Request";
            case 401: return "Unauthorized";
            case 403: return "Forbidden";
            case 404: return "Not Found";
            case 409: return "Conflict";
            case 422: return "Unprocessable Entity";
            default: return "Internal Server Error";
        }
    }
}
