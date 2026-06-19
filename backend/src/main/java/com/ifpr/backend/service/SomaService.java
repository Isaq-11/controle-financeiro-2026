package com.ifpr.backend.service;

import org.springframework.stereotype.Service;

import com.ifpr.backend.model.Soma;

@Service
public class SomaService {

    public Double somar(Soma soma){
        return soma.getValor1() + soma.getValor2();
    }
    
}
