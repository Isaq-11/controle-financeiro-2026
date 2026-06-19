package com.ifpr.backend.service;

import org.springframework.stereotype.Service;

import com.ifpr.backend.model.CalcularJuroComposto;

@Service
public class CalcularJuroCompostoService {
    
    public Double calcularJuroComposto(CalcularJuroComposto juroComposto){

        return juroComposto.getValorInicial() * Math.pow((1 + juroComposto.getTaxaMensal() / 100.0), juroComposto.getQuantidadeMeses());
    }
}
