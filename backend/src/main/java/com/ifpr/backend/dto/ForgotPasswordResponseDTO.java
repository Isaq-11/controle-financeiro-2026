package com.ifpr.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ForgotPasswordResponseDTO {
    private String message;
    private String debugToken;

    public ForgotPasswordResponseDTO(String message) {
        this.message = message;
    }
}
