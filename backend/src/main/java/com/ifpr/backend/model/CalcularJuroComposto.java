package com.ifpr.backend.model;

import lombok.Data;

@Data
public class CalcularJuroComposto {
    private Double valorInicial;
    private Double taxaMensal;
    private int quantidadeMeses;
}
